/* eslint-disable react-hooks/exhaustive-deps */
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useState, useEffect, useRef, Fragment } from "react";
import { renderIndex, showToast } from "./../../utils/common";
import { getCookie } from "../../utils/common";
import { runWithDelay } from "../../utils/common";
import Table from "../../components/Table/Table";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { customerSourceBreadcrumbItems } from "../../utils/breadcrumbs";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import Pagination from "../../components/Pagination/Pagination";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../components/Loading/Loading";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import { useRedirectIfNoToken, useModalFade, useCloseModal } from "../../utils/common";
import type { ModalState } from "../../utils/common";
import ModalCustomerSource from "./partials/ModalCustomerSource";
import type { ICustomerSourceResponse } from "../../model/customerSource/CustomerSourceResponseModel";
import type { ICustomerSourceListRequest, ICustomerSourceRequest } from "../../model/customerSource/CustomerSourceRequestModel";
import CustomerSourceService from "../../services/CustomerSourceService";

export default function CustomerSource() {
  document.title = "Danh sách nguồn khách hàng";
  const [listCustomerSource, setListCustomerSource] = useState<ICustomerSourceResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const [params, setParams] = useState<ICustomerSourceListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<ICustomerSourceResponse[]>([]);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const token = getCookie("token");
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);

  const handleSearch = (keyword: string) => {
    setParams((prev) => ({
      ...prev,
      keyword: keyword,
      page: 1,
    }));
  };

  useEffect(() => {
    const valView = localStorage.getItem("CUSTOMER_SOURCE_VIEW");
    const valAdd = localStorage.getItem("CUSTOMER_SOURCE_ADD");
    const valDelete = localStorage.getItem("CUSTOMER_SOURCE_DELETE");
    const valEdit = localStorage.getItem("CUSTOMER_SOURCE_UPDATE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanDelete(valDelete === "1");
    setCanEdit(valEdit === "1");
  }, []);

  useEffect(() => {
    getListCustomerSource(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListCustomerSource = async (paramsSearch: ICustomerSourceListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => CustomerSourceService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListCustomerSource(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddCustomerSource = async (payload: ICustomerSourceRequest) => {
    setIsLoading(true);
    const response = await CustomerSourceService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm nguồn khách hàng thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListCustomerSource({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm nguồn khách hàng thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditCustomerSource = async (payload: ICustomerSourceRequest) => {
    setIsLoading(true);
    const response = await CustomerSourceService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật nguồn khách hàng thành công!", "success");
      closeModal();
      await getListCustomerSource(params);
    } else {
      showToast(response?.message ?? "Cập nhật nguồn khách hàng thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteCustomerSource = async () => {
    if (!modal.item) return;
    const customerSourceItem = modal.item as ICustomerSourceResponse;
    setIsLoading(true);
    const response = await CustomerSourceService.delete(customerSourceItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listCustomerSource.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa nguồn khách hàng thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListCustomerSource({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa nguồn khách hàng thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const columns = [
    {
      key: "stt",
      title: "Số thứ tự",
      render: (_row: ICustomerSourceResponse, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
      className: "w-1 text-center",
    },
    {
      key: "name",
      title: "Tên nguồn khách hàng",
    },
    {
      key: "status",
      title: "Trạng thái",
      className: "text-center",
      render: (row: ICustomerSourceResponse) => (
        <span className={Number(row.status) === 1 ? "badge badge-soft-success" : "badge badge-soft-danger"}>
          {Number(row.status) === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
        </span>
      ),
    },
  ];

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
                Nguồn khách hàng
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={customerSourceBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListCustomerSource(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={handleSearch} />
              {canAdd && <AddButton label="Thêm nguồn khách hàng" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              {!isLoading && listCustomerSource?.length > 0 ? (
                <Table
                  id="customer_source_list"
                  data={listCustomerSource}
                  columns={columns}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as ICustomerSourceResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as ICustomerSourceResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as ICustomerSourceResponse }) : undefined,
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
                      Hiện tại chưa có nguồn khách hàng nào.
                      <br />
                      Hãy thêm mới nguồn khách hàng đầu tiên nhé!
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

      {/* Modal */}
      <ModalCustomerSource
        type={modal.type}
        shown={modalShown}
        item={modal.item as ICustomerSourceResponse}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddCustomerSource : handleEditCustomerSource}
        onDelete={handleDeleteCustomerSource}
      />
    </div>
  );
}
