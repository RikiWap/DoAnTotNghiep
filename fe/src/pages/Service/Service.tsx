/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import ModalService from "./partials/ModalService";
import { serviceBreadcrumbItems } from "../../utils/breadcrumbs";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import ExportButton from "../../components/ExportButton/ExportButton";
import Pagination from "../../components/Pagination/Pagination";
import Loading from "../../components/Loading/Loading";
import Table from "../../components/Table/Table";
import { usePagination } from "../../hooks/usePagination";
import ServiceService from "../../services/ServiceService";
import type { IServiceRequest, IServiceListRequest } from "../../model/service/ServiceRequestModel";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import ManageColumns from "../../components/ManageColumns/ManageColumns";
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
import type { IServiceResponse } from "../../model/service/ServiceResponseModel";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function Service() {
  document.title = "Danh sách dịch vụ";

  const [listServices, setListServices] = useState<IServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const [params, setParams] = useState<IServiceListRequest>({
    page: 1,
    limit: 10,
    keyword: "",
    isCombo: undefined,
    featured: undefined,
  });

  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<IServiceRequest[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const token = getCookie("token");
  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);

  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);

  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const valView = localStorage.getItem("SERVICE_VIEW");
    const valAdd = localStorage.getItem("SERVICE_ADD");
    const valEdit = localStorage.getItem("SERVICE_UPDATE");
    const valDelete = localStorage.getItem("SERVICE_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  const [columnDefs, setColumnDefs] = useState([
    { key: "stt", title: "Số thứ tự", visible: true },
    { key: "avatar", title: "Ảnh", visible: true },
    { key: "code", title: "Mã dịch vụ", visible: true },
    { key: "name", title: "Tên dịch vụ", visible: true },
    { key: "categoryName", title: "Danh mục", visible: true },
    { key: "price", title: "Giá bán", visible: true },
    { key: "cost", title: "Giá vốn", visible: false },
    { key: "isCombo", title: "Loại", visible: true },
    { key: "featured", title: "Nổi bật", visible: true },
  ]);

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const getVisibleColumns = () => {
    const allColumns = [
      {
        key: "stt",
        title: "Số thứ tự",
        render: (_row: any, _value: any, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
        className: "w-1 text-center",
      },
      {
        key: "code",
        title: "Mã dịch vụ",
        render: (row: IServiceResponse) => <span className="fw-bold text-primary">#{row.code}</span>,
        className: "align-middle",
      },
      {
        key: "name",
        title: "Tên dịch vụ",
        render: (row: IServiceResponse) => (
          <div className="d-flex align-items-center">
            <div className="avatar avatar-sm rounded-circle border me-2">
              <img
                src={row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || "Service")}&background=random`}
                alt={row.name}
                className="w-100 h-100 object-fit-cover rounded-circle"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || "Service")}&background=random`;
                }}
              />
            </div>
            <span className="fs-14">{row.name}</span>
          </div>
        ),
      },
      { key: "categoryName", title: "Danh mục" },
      {
        key: "price",
        title: "Giá bán",
        render: (row: IServiceResponse) => (
          <span className="fw-bold text-dark">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.price || 0)}</span>
        ),
      },
      {
        key: "cost",
        title: "Giá vốn",
        render: (row: IServiceRequest) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.cost || 0),
      },
      {
        key: "isCombo",
        title: "Loại",
        className: "text-center",
        render: (row: IServiceRequest) =>
          row.isCombo === 1 ? <span className="badge badge-soft-warning">Combo</span> : <span className="badge badge-soft-info">Thường</span>,
      },
      {
        key: "featured",
        title: "Nổi bật",
        className: "text-center",
        render: (row: IServiceRequest) => (row.featured === 1 ? <i className="ti ti-star-filled text-warning fs-18" title="Nổi bật"></i> : null),
      },
    ];

    return allColumns.filter((col) => {
      const def = columnDefs.find((c) => c.key === col.key);
      return def ? def.visible : true;
    });
  };

  useEffect(() => {
    getListServices(params);
    return () => abortController.current?.abort();
  }, [params.page, params.limit, params.keyword]);

  const getListServices = async (paramsSearch: IServiceListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => ServiceService.list(paramsSearch, token, abortController.current?.signal), 500);

    if (response && response.code === 200) {
      const result = response.result;
      setListServices(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Lỗi tải danh sách dịch vụ", "error");
    }
    setIsLoading(false);
  };

  const handleAddService = async (payload: IServiceRequest) => {
    setIsLoading(true);
    const response = await ServiceService.update(payload, token || "");
    if (response && response.code === 200) {
      showToast("Thêm dịch vụ thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListServices({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleEditService = async (payload: IServiceRequest) => {
    setIsLoading(true);
    const response = await ServiceService.update(payload, token || "");
    if (response && response.code === 200) {
      showToast("Cập nhật dịch vụ thành công!", "success");
      closeModal();
      await getListServices(params);
    } else {
      showToast(response?.message ?? "Cập nhật thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteService = async () => {
    if (!modal.item) return;
    const item = modal.item as IServiceRequest;
    if (!item.id) return;

    setIsLoading(true);
    const response = await ServiceService.delete(item.id, token || "");
    const safePage = params.page ?? 1;
    const newPage = listServices.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa dịch vụ thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListServices({ ...params, page: newPage });
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
                Danh sách dịch vụ
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={serviceBreadcrumbItems} />
            </div>

            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListServices(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm dịch vụ" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap"></div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
                  {/* <ViewSwitcher /> */}
                </div>
              </div>

              {!isLoading && listServices?.length > 0 ? (
                <Table
                  id="services_list"
                  data={listServices}
                  columns={getVisibleColumns()}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as IServiceResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as IServiceResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as IServiceResponse }) : undefined,
                  }}
                />
              ) : isLoading ? (
                <div className="text-center py-5">
                  <Loading />
                </div>
              ) : (
                <Fragment>
                  {isNoItem ? (
                    <div className="text-center py-5">
                      Hiện tại chưa có dịch vụ nào.
                      <br />
                      Hãy thêm mới dịch vụ đầu tiên nhé!
                    </div>
                  ) : (
                    <div className="text-center py-5">Không có dữ liệu trùng khớp.</div>
                  )}
                </Fragment>
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

      <ModalService
        type={modal.type}
        shown={modalShown}
        item={modal.item as IServiceRequest}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddService : handleEditService}
        onDelete={handleDeleteService}
      />
    </div>
  );
}
