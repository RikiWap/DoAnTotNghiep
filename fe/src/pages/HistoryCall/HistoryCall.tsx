/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import Pagination from "../../components/Pagination/Pagination";
import Loading from "../../components/Loading/Loading";
import Table from "../../components/Table/Table";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import ManageColumns from "../../components/ManageColumns/ManageColumns";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import ModalHistoryCall from "./partials/ModalHistoryCall";

import { usePagination } from "../../hooks/usePagination";
import {
  getCookie,
  runWithDelay,
  showToast,
  useCloseModal,
  useModalFade,
  useRedirectIfNoToken,
  type ModalState,
  renderIndex,
} from "../../utils/common";

import CallHistoryService from "../../services/CallHistoryService";
import type { ICallHistoryListRequest, ICallHistoryRequest } from "../../model/historyCall/HistoryCallRequestModel";
import type { ICallHistoryResponse } from "../../model/historyCall/HistoryCallResponseModel";
import { callHistoryBreadcrumbItems } from "../../utils/breadcrumbs";
import UserService from "../../services/UserService";
import CustomerService from "../../services/CustomerService";

export default function HistoryCall() {
  document.title = "Lịch sử cuộc gọi";
  const [listCall, setListCall] = useState<ICallHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [params, setParams] = useState<ICallHistoryListRequest>({
    page: 1,
    limit: 10,
    keyword: "",
  });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<ICallHistoryResponse[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const token = getCookie("token");
  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);
  const [userMap, setUserMap] = useState<Record<number, string>>({});
  const [customerMap, setCustomerMap] = useState<Record<number, string>>({});

  const [canView, setCanView] = useState<boolean | null>(true);
  const [canAdd, setCanAdd] = useState<boolean | null>(true);
  const [canDelete, setCanDelete] = useState<boolean | null>(true);
  const [canEdit, setCanEdit] = useState<boolean | null>(true);

  useEffect(() => {
    const valView = localStorage.getItem("CALL_HISTORY_VIEW");
    const valAdd = localStorage.getItem("CALL_HISTORY_ADD");
    const valEdit = localStorage.getItem("CALL_HISTORY_UPDATE");
    const valDelete = localStorage.getItem("CALL_HISTORY_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  useEffect(() => {
    const fetchReferenceData = async () => {
      if (!token) return;
      try {
        const [userRes, customerRes] = await Promise.all([
          UserService.list({ page: 1, limit: 2000 }, token),
          CustomerService.list({ page: 1, limit: 2000 }, token),
        ]);
        if (userRes?.result?.items || userRes?.data?.items) {
          const users = userRes.result?.items || userRes.data?.items || [];
          const map: Record<number, string> = {};
          users.forEach((u: any) => {
            map[u.id] = u.fullname || u.username || u.name || `User ${u.id}`;
          });
          setUserMap(map);
        }
        if (customerRes?.result?.items || customerRes?.data?.items) {
          const customers = customerRes.result?.items || customerRes.data?.items || [];
          const map: Record<number, string> = {};
          customers.forEach((c: any) => {
            map[c.id] = c.name || `Customer ${c.id}`;
          });
          setCustomerMap(map);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu tham chiếu:", error);
      }
    };
    fetchReferenceData();
  }, [token]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const [columnDefs, setColumnDefs] = useState([
    { key: "stt", title: "Số thứ tự", visible: true },
    { key: "type", title: "Loại", visible: true },
    { key: "users", title: "Người tham gia", visible: true },
    { key: "outcome", title: "Kết quả", visible: true },
    { key: "duration", title: "Thời lượng", visible: true },
    { key: "rating", title: "Đánh giá", visible: true },
    { key: "status", title: "Trạng thái", visible: true },
  ]);

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const handleToggleStatus = async (call: ICallHistoryResponse) => {
    const prevCallHistory = [...listCall];
    const newStatus = Number(call.status) === 1 ? 0 : 1;
    setListCall((prev) => prev.map((item) => (item.id === call.id ? { ...item, status: newStatus } : item)));
    const response = await CallHistoryService.updateStatus(call.id, newStatus, token);
    if (response && response.code === 200) {
      showToast("Đổi trạng thái thành công!", "success");
      CallHistoryService.list(params, token).then((res) => {
        if (res && res.code === 200) {
          setListCall(res.result.items || []);
        }
      });
    } else {
      showToast(response?.message ?? "Đổi trạng thái thất bại. Vui lòng thử lại!", "error");
      setListCall(prevCallHistory);
    }
  };

  const getVisibleColumns = () => {
    const allColumns = [
      {
        key: "stt",
        title: "Số thứ tự",
        render: (_row: any, _val: any, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
        className: "w-1 text-center",
      },
      {
        key: "type",
        title: "Loại",
        className: "text-center",
        render: (row: ICallHistoryResponse) => (
          <span className="fs-18 text-primary" title={row.callType === 1 ? "Audio" : "Video"}>
            {row.callType === 1 ? <i className="ti ti-phone" /> : <i className="ti ti-video" />}
          </span>
        ),
      },
      {
        key: "users",
        title: "Người tham gia",
        render: (row: ICallHistoryResponse) => (
          <div>
            <div className="d-flex align-items-center mb-1">
              <i className="ti ti-user-circle me-1 text-muted"></i>
              <span className="text-muted small">{userMap[row.userId] || row.userName || `ID: ${row.userId}`}</span>
            </div>
            <div className="d-flex align-items-center">
              <i className="ti ti-user me-1 text-muted"></i>
              <span className="text-muted small">{customerMap[row.customerId] || row.customerName || `ID: ${row.customerId}`}</span>
            </div>
          </div>
        ),
      },
      {
        key: "outcome",
        title: "Kết quả",
        className: "text-center",
        render: (row: ICallHistoryResponse) => {
          let badgeClass = "badge-soft-secondary";
          let label = "Unknown";
          if (row.outcome === 1) {
            badgeClass = "badge-soft-success";
            label = "Cuộc gọi đến";
          } else if (row.outcome === 2) {
            badgeClass = "badge-soft-info";
            label = "Cuộc gọi đi";
          } else if (row.outcome === 3) {
            badgeClass = "badge-soft-danger";
            label = "Cuộc gọi nhỡ";
          }
          return <span className={`badge ${badgeClass}`}>{label}</span>;
        },
      },
      {
        key: "duration",
        title: "Thời lượng",
        className: "text-center font-monospace",
        render: (row: ICallHistoryResponse) => formatDuration(row.duration),
      },
      {
        key: "rating",
        title: "Đánh giá",
        render: (row: ICallHistoryResponse) => (
          <div className="text-warning">
            {row.outcome === 3 ? (
              <span className="text-muted small">-</span>
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={`ti ti-star ${i < row.interestLevel ? "fs-12" : "fs-12 text-muted opacity-25"}`} />
              ))
            )}
          </div>
        ),
      },
      {
        key: "status",
        title: "Trạng thái",
        className: "text-center",
        render: (row: ICallHistoryResponse) => (
          <span
            className={Number(row.status) === 1 ? "badge badge-soft-success" : "badge badge-soft-danger"}
            style={{ cursor: "pointer" }}
            onClick={() => handleToggleStatus(row)}
          >
            {Number(row.status) === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
          </span>
        ),
      },
    ];

    return allColumns.filter((col) => {
      const def = columnDefs.find((c) => c.key === col.key);
      return def ? def.visible : true;
    });
  };

  const getListCall = async (paramsSearch: ICallHistoryListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => CallHistoryService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response) {
      const result = response.result || response.data || {};
      const items = result.items || [];
      setListCall(items);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0);
    } else {
      showToast("Có lỗi xảy ra khi tải dữ liệu", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getListCall(params);
    return () => abortController.current?.abort();
  }, [params.page, params.limit, params.keyword]);

  const handleAdd = async (payload: ICallHistoryRequest) => {
    setIsLoading(true);
    const response = await CallHistoryService.update(payload, token || "");
    if (response && (response.code === 200 || response.success)) {
      showToast("Thêm cuộc gọi thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListCall({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleEdit = async (payload: ICallHistoryRequest) => {
    setIsLoading(true);
    const response = await CallHistoryService.update(payload, token || "");
    if (response && (response.code === 200 || response.success)) {
      showToast("Cập nhật thành công!", "success");
      closeModal();
      await getListCall(params);
    } else {
      showToast(response?.message ?? "Cập nhật thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const item = modal.item as ICallHistoryResponse;
    if (!item?.id) return;
    setIsLoading(true);
    const response = await CallHistoryService.updateStatus(item.id, 0, token || "");
    if (response && (response.code === 200 || response.success)) {
      showToast("Đã chuyển trạng thái sang ngưng hoạt động!", "success");
      closeModal();
      await getListCall(params);
    } else {
      showToast(response?.message ?? "Xóa thất bại", "error");
    }
    setIsLoading(false);
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
        <div className="content pb-0">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Lịch sử cuộc gọi
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={callHistoryBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <RefreshButton onRefresh={() => getListCall(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm cuộc gọi" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div />
                <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
              </div>

              {!isLoading && listCall?.length > 0 ? (
                <Table
                  id="call_history_list"
                  data={listCall}
                  columns={getVisibleColumns()}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as ICallHistoryResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as ICallHistoryResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as ICallHistoryResponse }) : undefined,
                  }}
                />
              ) : isLoading ? (
                <div className="text-center py-5">
                  <Loading />
                </div>
              ) : (
                <div className="text-center py-5">{isNoItem ? "Chưa có dữ liệu." : "Không tìm thấy dữ liệu trùng khớp."}</div>
              )}

              <div className="mt-3">
                <Pagination
                  total={pagination.totalItem}
                  page={pagination.page}
                  perPage={pagination.limit}
                  onPageChange={pagination.setPage}
                  onPerPageChange={pagination.chooseLimit}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <ModalHistoryCall
        type={modal.type}
        shown={modalShown}
        item={modal.item as ICallHistoryResponse}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAdd : handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
