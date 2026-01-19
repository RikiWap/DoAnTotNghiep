/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import ModalInvoice from "./partials/ModalInvoice";
import { invoiceBreadcrumbItems } from "../../utils/breadcrumbs";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import ExportButton from "../../components/ExportButton/ExportButton";
import Pagination from "../../components/Pagination/Pagination";
import Loading from "../../components/Loading/Loading";
import Table from "../../components/Table/Table";
import { usePagination } from "../../hooks/usePagination";
import type { IInvoiceRequest, IInvoiceListRequest } from "../../model/invoice/InvoiceRequestModel";
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
import type { IInvoiceResponse } from "../../model/invoice/InvoiceResponseModel";
import InvoiceService from "../../services/InvoiceService";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function Invoices() {
  document.title = "Danh sách hoá đơn";

  const [listInvoice, setListInvoice] = useState<IInvoiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [params, setParams] = useState<IInvoiceListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<IInvoiceResponse[]>([]);
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

  const [columnDefs, setColumnDefs] = useState([
    { key: "stt", title: "Số thứ tự", visible: true },
    { key: "invoice_code", title: "Mã hóa đơn", visible: true },
    { key: "customer_info", title: "Khách hàng", visible: true },
    { key: "amount", title: "Tổng tiền", visible: true },
    { key: "payment_type", title: " Loại thanh toán", visible: true },
    { key: "status", title: "Trạng thái", visible: true },
    { key: "created_time", title: "Ngày tạo", visible: true },
  ]);

  const handleSearch = (keyword: string) => {
    setParams((prev) => ({
      ...prev,
      keyword: keyword,
      page: 1,
    }));
  };

  useEffect(() => {
    const valView = localStorage.getItem("INVOICE_VIEW");
    const valAdd = localStorage.getItem("INVOICE_ADD");
    const valEdit = localStorage.getItem("INVOICE_UPDATE");
    const valDelete = localStorage.getItem("INVOICE_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", { hour12: false });
  };

  const getVisibleColumns = () => {
    const allColumns = [
      {
        key: "stt",
        title: "Số thứ tự",
        render: (_row: IInvoiceResponse, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
        className: "w-1 text-center align-middle",
      },
      {
        key: "invoice_code",
        title: "Mã hóa đơn",
        render: (row: IInvoiceResponse) => <span className="fw-bold text-primary">#{row.invoiceCode}</span>,
        className: "align-middle",
      },
      {
        key: "customer_info",
        title: "Khách hàng",
        render: (row: IInvoiceResponse) => (
          <div className="d-flex flex-column">
            <span className="fw-medium text-body">{row.customerName || "Khách lẻ"}</span>
            {row.phone && <small className="text-muted">{row.phone}</small>}
          </div>
        ),
        className: "align-middle",
      },
      {
        key: "amount",
        title: "Tạm tính",
        render: (row: IInvoiceResponse) => <span className="fw-bold text-dark">{formatCurrency(row.amount || 0)}</span>,
        className: "align-middle",
      },
      {
        key: "discount",
        title: "Giảm giá",
        render: (row: IInvoiceResponse) => <span className="fw-bold text-dark">{formatCurrency(row.discount || 0)}</span>,
        className: "align-middle",
      },
      {
        key: "fee",
        title: "Tổng tiền",
        render: (row: IInvoiceResponse) => <span className="fw-bold text-dark">{formatCurrency(row.fee)}</span>,
        className: "align-middle",
      },
      {
        key: "payment_type",
        title: "Loại thanh toán",
        render: (row: IInvoiceResponse) => {
          if (row.paymentType === 2) {
            return <span className="badge badge-soft-info">Chuyển khoản</span>;
          }
          return <span className="badge badge-soft-success">Tiền mặt</span>;
        },
        className: "text-center align-middle",
      },
      {
        key: "status",
        title: "Trạng thái",
        render: (row: IInvoiceResponse) => {
          return row.status === 1 ? (
            <span className="badge badge-soft-success">Hoàn tất</span>
          ) : (
            <span className="badge badge-soft-warning">Hóa đơn nháp</span>
          );
        },
        className: "text-center align-middle",
      },
      {
        key: "created_time",
        title: "Ngày tạo",
        render: (row: IInvoiceResponse) => <span className="fs-13 text-muted">{formatDate(row.createdTime || row.receiptDate)}</span>,
        className: "align-middle text-center",
      },
    ];

    return allColumns.filter((col) => {
      const def = columnDefs.find((c) => c.key === col.key);
      return def ? def.visible : true;
    });
  };

  useEffect(() => {
    getListInvoice(params);
    return () => abortController.current?.abort();
  }, [params.page, params.limit, params.keyword]);

  const getListInvoice = async (paramsSearch: IInvoiceListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => InvoiceService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListInvoice(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddInvoice = async (payload: IInvoiceRequest) => {
    setIsLoading(true);
    const response = await InvoiceService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm hoá đơn thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListInvoice({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm hoá đơn thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditInvoice = async (payload: IInvoiceRequest) => {
    setIsLoading(true);
    const response = await InvoiceService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật hoá đơn thành công!", "success");
      closeModal();
      await getListInvoice(params);
    } else {
      showToast(response?.message ?? "Cập nhật hoá đơn thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteInvoice = async () => {
    if (!modal.item) return;
    const invoiceItem = modal.item as IInvoiceResponse;

    setIsLoading(true);
    const response = await InvoiceService.delete(invoiceItem.id!, token);
    const safePage = params.page ?? 1;
    const newPage = listInvoice.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa hoá đơn thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListInvoice({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa hoá đơn thất bại. Vui lòng thử lại!", "error");
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
                Danh sách hoá đơn
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={invoiceBreadcrumbItems} />
            </div>

            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListInvoice(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={handleSearch} />
              {canAdd && <AddButton label="Thêm hoá đơn" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap"></div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
                  {/* <ViewSwitcher /> */}
                </div>
              </div>

              {!isLoading && listInvoice?.length > 0 ? (
                <Table
                  id="invoice_list"
                  data={listInvoice}
                  columns={getVisibleColumns()}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as IInvoiceResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as IInvoiceResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as IInvoiceResponse }) : undefined,
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
                      Hiện tại chưa có hoá đơn nào.
                      <br />
                      Hãy thêm mới hoá đơn đầu tiên nhé!
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      Không có dữ liệu trùng khớp.
                      <br />
                      Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                    </div>
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

      <ModalInvoice
        type={modal.type}
        shown={modalShown}
        item={modal.item as IInvoiceResponse}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddInvoice : handleEditInvoice}
        onDelete={handleDeleteInvoice}
      />
    </div>
  );
}
