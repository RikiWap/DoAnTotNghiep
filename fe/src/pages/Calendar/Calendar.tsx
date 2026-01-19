/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useRedirectIfNoToken, useModalFade, useCloseModal } from "../../utils/common";
import { showToast } from "../../utils/common";
import { getCookie } from "../../utils/common";
import type { ModalState } from "../../utils/common";
import Loading from "../../components/Loading/Loading";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import ScheduleService from "../../services/ScheduleService";
import type { IScheduleResponse } from "../../model/schedule/ScheduleResponseModel";
import type { IScheduleRequest } from "../../model/schedule/ScheduleRequestModel";
import ModalSchedule from "./partials/ModalCalendar";
import CustomerService from "../../services/CustomerService";
import UserService from "../../services/UserService";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";

const externalEvents = [
  { title: "Lịch thực hiện dịch vụ", class: "bg-success", type: 1 },
  { title: "Lịch tư vấn", class: "bg-warning", type: 2 },
  { title: "Họp nội bộ", class: "bg-info", type: 3 },
];

export default function Calendar() {
  const [listSchedules, setListSchedules] = useState<IScheduleResponse[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [customerOptions, setCustomerOptions] = useState<Array<{ id?: number | string; name?: string }>>([]);
  const [userOptions, setUserOptions] = useState<Array<{ id?: number | string; name?: string }>>([]);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modal, setModal] = useState<ModalState & { initialDate?: { start: string; end: string } }>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const draggableElRef = useRef<HTMLDivElement>(null);
  const [filterCategories] = useState([
    { label: "Tư vấn", id: 1, checked: true },
    { label: "Dịch vụ", id: 2, checked: true },
    { label: "Khác", id: 3, checked: true },
  ]);

  const token = getCookie("token");
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);

  useEffect(() => {
    const valView = localStorage.getItem("SCHEDULE_VIEW") || "1";
    const valAdd = localStorage.getItem("SCHEDULE_ADD") || "1";
    const valEdit = localStorage.getItem("SCHEDULE_UPDATE") || "1";
    const valDelete = localStorage.getItem("SCHEDULE_DELETE") || "1";
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [customerRes, userRes] = await Promise.all([
          CustomerService.list({ page: 1, limit: 1000 }, token),
          UserService.list({ page: 1, limit: 1000 }, token),
        ]);

        if (customerRes && (customerRes.success || customerRes.code === 200)) {
          const data = customerRes.data || customerRes.result;
          setCustomerOptions(data?.items || []);
        }

        if (userRes && (userRes.success || userRes.code === 200)) {
          const data = userRes.data || userRes.result;
          setUserOptions(data?.items || []);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      }
    };

    if (token) {
      fetchMasterData();
      getListSchedules();
    }

    return () => abortController.current?.abort();
  }, [token]);

  useEffect(() => {
    const mapped = listSchedules.map((item) => ({
      id: String(item.id),
      title: item.title,
      start: item.startTime,
      end: item.endTime,
      className: item.type === 1 ? "bg-success" : item.type === 2 ? "bg-warning" : "bg-info",
      extendedProps: { ...item },
    }));
    setEvents(mapped);
  }, [listSchedules]);

  useEffect(() => {
    if (isLoading || !canAdd || !draggableElRef.current) return;

    const draggable = new Draggable(draggableElRef.current, {
      itemSelector: ".fc-event",
      eventData: function (eventEl) {
        const title = eventEl.innerText;
        const className = eventEl.getAttribute("data-class");
        const type = eventEl.getAttribute("data-type");

        return {
          title: title,
          classNames: className ? [className] : [],
          duration: "01:00",
          extendedProps: {
            type: Number(type),
          },
          create: true,
        };
      },
    });

    return () => {
      draggable.destroy();
    };
  }, [isLoading, canAdd]);

  const getListSchedules = async () => {
    setIsLoading(true);
    const res = await ScheduleService.list({ page: 1, limit: 1000 }, token);
    if (res && (res.success || res.code === 200)) {
      const data = res.data || res.result;
      setListSchedules(data?.items || []);
    } else {
      showToast("Không thể tải lịch hẹn", "error");
    }
    setIsLoading(false);
  };

  const handleAddSchedule = async (payload: IScheduleRequest) => {
    const res = await ScheduleService.update(payload, token);
    if (res && (res.success || res.code === 200)) {
      showToast("Tạo lịch hẹn thành công!", "success");
      closeModal();
      getListSchedules();
    } else {
      showToast(res?.message || "Tạo thất bại", "error");
    }
  };

  const handleEditSchedule = async (payload: IScheduleRequest) => {
    const res = await ScheduleService.update(payload, token);
    if (res && (res.success || res.code === 200)) {
      showToast("Cập nhật thành công!", "success");
      closeModal();
      getListSchedules();
    } else {
      showToast(res?.message || "Cập nhật thất bại", "error");
    }
  };

  const handleDeleteSchedule = async () => {
    if (!modal.item) return;
    const res = await ScheduleService.delete(Number((modal.item as IScheduleResponse).id), token);
    if (res && (res.success || res.code === 200)) {
      showToast("Đã xóa sự kiện!", "success");
      closeModal();
      getListSchedules();
    } else {
      showToast("Xóa thất bại", "error");
    }
  };

  const renderEventContent = (eventInfo: any) => {
    return (
      <div
        className="d-flex align-items-center justify-content-between w-100 px-1 overflow-hidden"
        style={{ height: "100%", cursor: "pointer" }}
        title="Double click để sửa"
        onDoubleClick={(e) => {
          e.stopPropagation();
          handleEventDoubleClick(eventInfo.event);
        }}
      >
        <div className="d-flex align-items-center overflow-hidden text-truncate">
          {eventInfo.timeText && <span className="fc-event-time me-1 fw-bold small">{eventInfo.timeText}</span>}
          <span className="fc-event-title text-truncate">{eventInfo.event.title}</span>
        </div>

        {!!canDelete && (
          <i
            className="ti ti-trash text-white cursor-pointer z-3 ms-1 p-1 hover-scale"
            style={{ fontSize: "14px" }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleDeleteIconClick(eventInfo.event);
            }}
            title="Xóa sự kiện"
          />
        )}
      </div>
    );
  };

  const handleDeleteIconClick = (event: any) => {
    const item = event.extendedProps as IScheduleResponse;
    setModal({ type: "delete", item });
  };

  const handleEventDoubleClick = (event: any) => {
    const item = event.extendedProps as IScheduleResponse;
    if (canEdit) setModal({ type: "edit", item });
    else if (canView) setModal({ type: "detail", item });
  };

  // const handleDateClick = (arg: any) => {
  //   if (!canAdd) return;
  //   const startStr = `${arg.dateStr}T09:00`;
  //   const endStr = `${arg.dateStr}T10:00`;
  //   setModal({ type: "add", initialDate: { start: startStr, end: endStr } });
  // };

  const handleDateClick = (arg: any) => {
    if (!canAdd) return;
    let startStr = arg.dateStr;
    let endStr = "";
    if (arg.view.type.includes("timeGrid")) {
      const startDate = new Date(arg.dateStr);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      endStr = endDate.toISOString();
    } else {
      startStr = `${arg.dateStr}T09:00:00`;
      endStr = `${arg.dateStr}T10:00:00`;
    }

    setModal({ type: "add", initialDate: { start: startStr, end: endStr } });
  };

  const handleDateSelect = (selectInfo: any) => {
    if (!canAdd) return;

    setModal({
      type: "add",
      initialDate: {
        start: selectInfo.startStr,
        end: selectInfo.endStr,
      },
    });
    selectInfo.view.calendar.unselect();
  };

  const handleEventChange = async (info: any) => {
    if (!canEdit) {
      info.revert();
      return;
    }
    const item = info.event.extendedProps as IScheduleResponse;
    const payload: IScheduleRequest = {
      id: Number(item.id),
      title: item.title,
      content: item.content,
      customerId: item.customerId,
      userId: item.userId,
      note: item.note,
      type: item.type,
      startTime: info.event.startStr,
      endTime: info.event.end ? info.event.endStr : info.event.startStr,
    };
    const res = await ScheduleService.update(payload, token);
    if (res && (res.success || res.code === 200)) {
      showToast("Cập nhật thời gian thành công!", "success");
    } else {
      info.revert();
      showToast("Cập nhật thất bại", "error");
    }
  };

  const handleEventReceive = (info: any) => {
    if (!canAdd) {
      info.revert();
      return;
    }

    const type = info.event.extendedProps?.type || 1;
    const startTime = info.event.startStr;
    const endTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();

    const tempItem: any = {
      id: 0,
      title: info.event.title,
      startTime: startTime,
      endTime: endTime,
      type: Number(type),
      content: "",
      note: "",
      customerId: undefined,
      userId: undefined,
    };

    info.event.remove();
    setModal({ type: "add", item: tempItem });
  };

  if (canView === null || canView === false) {
    return (
      <div className="main-wrapper">
        {!headerCollapsed && <Header />}
        <Sidebar />
        <div className="page-wrapper">
          <div className="content py-5 text-center">{canView === null ? <Loading /> : <ErrorPage505 />}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      {!headerCollapsed && <Header />}
      <Sidebar />

      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Lịch hẹn <span className="badge badge-soft-primary ms-2">{new Date().getFullYear()}</span>
              </h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <Link to="/">Trang chủ</Link>
                  </li>
                  <li className="breadcrumb-item active">Lịch hẹn</li>
                </ol>
              </nav>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListSchedules()} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-3 col-md-4">
              <div className="card">
                <div className="card-body">
                  {!!canAdd && (
                    <button className="btn btn-primary w-100 mb-4" onClick={() => setModal({ type: "add" })}>
                      <i className="ti ti-plus me-1"></i> Tạo sự kiện mới
                    </button>
                  )}

                  <div className="mb-4">
                    <h6 className="fw-medium mb-3">Kéo & Thả Sự Kiện</h6>
                    <div id="external-events" ref={draggableElRef}>
                      {externalEvents.map((item, index) => (
                        <div
                          key={index}
                          className={`fc-event external-event ${item.class} text-white d-flex align-items-center mb-2 p-2 rounded cursor-pointer`}
                          data-class={item.class}
                          data-type={item.type}
                          style={{ cursor: "grab" }}
                        >
                          <i className="ti ti-circle-filled fs-10 me-2"></i>
                          {item.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-0">
                    <h6 className="fw-medium mb-3">Bộ lọc danh mục</h6>
                    <div className="d-flex flex-column gap-2">
                      {filterCategories.map((cat, idx) => (
                        <div className="form-check" key={idx}>
                          <input className="form-check-input" type="checkbox" defaultChecked={cat.checked} id={`cat-${cat.id}`} />
                          <label className="form-check-label" htmlFor={`cat-${cat.id}`}>
                            {cat.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-9 col-md-8">
              <div className="card bg-white">
                <div className="card-body">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    locale={viLocale}
                    headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
                    buttonText={{ today: "Hôm nay", month: "Tháng", week: "Tuần", day: "Ngày", list: "Danh sách" }}
                    initialView="dayGridMonth"
                    editable={!!canEdit}
                    droppable={!!canAdd}
                    selectable={!!canAdd}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    events={events}
                    eventContent={renderEventContent}
                    dateClick={handleDateClick}
                    eventReceive={handleEventReceive}
                    select={handleDateSelect}
                    eventDrop={handleEventChange}
                    eventResize={handleEventChange}
                    height="auto"
                    contentHeight={650}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <ModalSchedule
        type={modal.type}
        shown={modalShown}
        item={modal.item as IScheduleResponse}
        initialDate={(modal as any).initialDate}
        customerOptions={customerOptions}
        userOptions={userOptions}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddSchedule : handleEditSchedule}
        onDelete={handleDeleteSchedule}
        onDeleteClick={() => setModal({ type: "delete", item: modal.item })}
      />
    </div>
  );
}
