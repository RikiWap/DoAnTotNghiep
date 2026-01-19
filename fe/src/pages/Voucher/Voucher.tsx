/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import ModalVoucher from "./partials/ModalVoucher";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import ExportButton from "../../components/ExportButton/ExportButton";
import Pagination from "../../components/Pagination/Pagination";
import Loading from "../../components/Loading/Loading";
import Table from "../../components/Table/Table";
import { usePagination } from "../../hooks/usePagination";
import type { IVoucherListRequest, IVoucherRequest } from "../../model/voucher/VoucherRequestModel";
import type { IVoucherResponse } from "../../model/voucher/VoucherResponseModel";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
// import ViewSwitcher from "../../components/ViewSwitcher/ViewSwitcher";
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
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import VoucherService from "../../services/VoucherService";
import { voucherBreadcrumbItems } from "../../utils/breadcrumbs";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";

export default function Voucher() {
  document.title = "Danh sách voucher";

  const [listVouchers, setListVouchers] = useState<IVoucherResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const [params, setParams] = useState<IVoucherListRequest>({
    page: 1,
    limit: 10,
    keyword: "",
  });

  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<IVoucherResponse[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const token = getCookie("token");

  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);

  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);

  useEffect(() => {
    const valView = localStorage.getItem("VOUCHER_VIEW");
    const valAdd = localStorage.getItem("VOUCHER_ADD");
    const valEdit = localStorage.getItem("VOUCHER_UPDATE");
    const valDelete = localStorage.getItem("VOUCHER_DELETE");
    setCanView(valView === "1" || true);
    setCanAdd(valAdd === "1" || true);
    setCanEdit(valEdit === "1" || true);
    setCanDelete(valDelete === "1" || true);
  }, []);

  const [columnDefs, setColumnDefs] = useState([
    { key: "stt", title: "Số thứ tự", visible: true },
    { key: "code", title: "Mã Voucher", visible: true },
    { key: "name", title: "Tên chương trình", visible: true },
    { key: "discount", title: "Giá trị giảm", visible: true },
    { key: "quantity", title: "Lượt dùng", visible: true },
    { key: "time", title: "Thời gian áp dụng", visible: true },
    { key: "status", title: "Trạng thái", visible: true },
  ]);

  // const handleSearch = (keyword: string) => {
  //   setParams((prev) => ({
  //     ...prev,
  //     keyword: keyword,
  //     page: 1,
  //   }));
  // };

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const getVisibleColumns = () => {
    const allColumns = [
      {
        key: "stt",
        title: "Số thứ tự",
        render: (_row: IVoucherResponse, _value: any, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
        className: "w-1 text-center",
      },
      {
        key: "code",
        title: "Mã voucher",
        render: (row: IVoucherResponse) => <span className="fw-bold text-primary">{row.code}</span>,
      },
      { key: "name", title: "Tên chương trình" },
      {
        key: "discount",
        title: "Giá trị giảm",
        render: (row: IVoucherResponse) => {
          if (row.discountType === 1) {
            return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.discountValue);
          } else {
            return (
              <div>
                <span className="fw-bold">{row.discountValue}%</span>
                {row.maxDiscount && row.maxDiscount > 0 && (
                  <div className="small text-muted">
                    Max: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.maxDiscount)}
                  </div>
                )}
              </div>
            );
          }
        },
      },
      {
        key: "quantity",
        title: "Lượt dùng",
        render: (row: IVoucherResponse) => (
          <span>
            <span className="text-success">{row.usageQuantity}</span> / {row.totalQuantity}
          </span>
        ),
      },
      {
        key: "time",
        title: "Thời gian",
        render: (row: IVoucherResponse) => (
          <div className="small">
            <div>{new Date(row.startDate).toLocaleDateString("vi-VN")}</div>
            <div className="text-muted">đến {new Date(row.endDate).toLocaleDateString("vi-VN")}</div>
          </div>
        ),
      },
      {
        key: "status",
        title: "Trạng thái",
        className: "w-1 text-center",
        render: (row: IVoucherResponse) => {
          const now = new Date();
          const start = new Date(row.startDate);
          const end = new Date(row.endDate);
          let statusLabel = "Ngưng hoạt động";
          let badgeClass = "badge badge-soft-danger";

          if (row.status === 1) {
            if (now < start) {
              statusLabel = "Chưa diễn ra";
              badgeClass = "badge badge-soft-info";
            } else if (now > end) {
              statusLabel = "Hết hạn";
              badgeClass = "badge badge-soft-secondary";
            } else {
              statusLabel = "Đang hoạt động";
              badgeClass = "badge badge-soft-success";
            }
          }

          return <span className={`badge ${badgeClass}`}>{statusLabel}</span>;
        },
      },
    ];

    return allColumns.filter((col) => {
      const def = columnDefs.find((c) => c.key === col.key);
      return def ? def.visible : true;
    });
  };

  useEffect(() => {
    getListVouchers(params);
    return () => abortController.current?.abort();
  }, [params.page, params.limit, params.keyword]);

  const getListVouchers = async (paramsSearch: IVoucherListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => VoucherService.list(paramsSearch, token, abortController.current?.signal), 500);

    if (response && response.code === 200) {
      const result = response.result;
      setListVouchers(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Lỗi tải danh sách voucher", "error");
    }
    setIsLoading(false);
  };

  const handleAddVoucher = async (payload: IVoucherRequest) => {
    setIsLoading(true);
    const response = await VoucherService.update(payload, token || "");
    if (response && response.code === 200) {
      showToast("Thêm voucher thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListVouchers({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleEditVoucher = async (payload: IVoucherRequest) => {
    setIsLoading(true);
    const response = await VoucherService.update(payload, token || "");
    if (response && response.code === 200) {
      showToast("Cập nhật voucher thành công!", "success");
      closeModal();
      await getListVouchers(params);
    } else {
      showToast(response?.message ?? "Cập nhật thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteVoucher = async () => {
    if (!modal.item) return;
    const item = modal.item as IVoucherResponse;
    setIsLoading(true);
    const response = await VoucherService.delete(item.id, token || "");
    const safePage = params.page ?? 1;
    const newPage = listVouchers.length === 1 && safePage > 1 ? safePage - 1 : safePage;

    if (response && response.code === 200) {
      showToast("Xóa voucher thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListVouchers({ ...params, page: newPage });
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
                Quản lý Voucher
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={voucherBreadcrumbItems} />
            </div>

            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListVouchers(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Tạo Voucher" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">{/* Filter Dropdown có thể đặt ở đây */}</div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
                  {/* <ViewSwitcher /> */}
                </div>
              </div>

              {!isLoading && listVouchers?.length > 0 ? (
                <Table
                  id="voucher_list"
                  data={listVouchers}
                  columns={getVisibleColumns()}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as IVoucherResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as IVoucherResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as IVoucherResponse }) : undefined,
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
                      Hiện tại chưa có voucher nào.
                      <br />
                      Hãy tạo voucher đầu tiên nhé!
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

      <ModalVoucher
        type={modal.type}
        shown={modalShown}
        item={modal.item as IVoucherResponse}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddVoucher : handleEditVoucher}
        onDelete={handleDeleteVoucher}
      />
    </div>
  );
}
