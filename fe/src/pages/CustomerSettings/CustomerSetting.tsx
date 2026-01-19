/* eslint-disable react-hooks/exhaustive-deps */
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useState, useEffect, useRef, Fragment } from "react";
import { useRedirectIfNoToken, useModalFade, useCloseModal, renderIndex } from "../../utils/common";
import type { ModalState } from "../../utils/common";
import { showToast } from "../../utils/common";
import { getCookie } from "../../utils/common";
import { runWithDelay } from "../../utils/common";
import Table from "../../components/Table/Table";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { customerAttributeBreadcrumbItems } from "../../utils/breadcrumbs";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import Pagination from "../../components/Pagination/Pagination";
import CustomerAttributeService from "../../services/CustomerAttributeService";
import type { ICustomerAttributeResponse } from "../../model/customerAttribute/CustomerAttributeResponseModel";
import type { ICustomerAttributeRequest, ICustomerAttributeListRequest } from "../../model/customerAttribute/CustomerAttributeRequestModel";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../components/Loading/Loading";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import ModalCustomerAttribute from "./partials/ModalCustomerSetting";

export default function CustomerSetting() {
  const [listCustomerAttributes, setListCustomerAttributes] = useState<ICustomerAttributeResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const [params, setParams] = useState<ICustomerAttributeListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<ICustomerAttributeResponse[]>([]);
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

  useEffect(() => {
    const valView = localStorage.getItem("CUSTOMER_ATTRIBUTE_VIEW");
    const valAdd = localStorage.getItem("CUSTOMER_ATTRIBUTE_ADD");
    const valEdit = localStorage.getItem("CUSTOMER_ATTRIBUTE_UPDATE");
    const valDelete = localStorage.getItem("CUSTOMER_ATTRIBUTE_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  useEffect(() => {
    getListCustomerAttributes(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListCustomerAttributes = async (paramsSearch: ICustomerAttributeListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => CustomerAttributeService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListCustomerAttributes(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddCustomerAttribute = async (payload: ICustomerAttributeRequest) => {
    setIsLoading(true);
    const response = await CustomerAttributeService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm thuộc tính thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListCustomerAttributes({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm thuộc tính thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditCustomerAttribute = async (payload: ICustomerAttributeRequest) => {
    setIsLoading(true);
    const response = await CustomerAttributeService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật thuộc tính thành công!", "success");
      closeModal();
      await getListCustomerAttributes(params);
    } else {
      showToast(response?.message ?? "Cập nhật thuộc tính thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteCustomerAttribute = async () => {
    if (!modal.item) return;
    const customerAttributeItem = modal.item as ICustomerAttributeResponse;
    setIsLoading(true);
    const response = await CustomerAttributeService.delete(customerAttributeItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listCustomerAttributes.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa thuộc tính thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListCustomerAttributes({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa thuộc tính thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const columns = [
    {
      key: "stt",
      title: "Số thứ tự",
      render: (_row: ICustomerAttributeResponse, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
      className: "w-1 text-center",
    },
    {
      key: "name",
      title: "Tên thuộc tính",
    },
    {
      key: "datatype",
      title: "Loại dữ liệu",
    },
    {
      key: "position",
      title: "Vị trí hiển thị",
      className: "text-center",
    },
    {
      key: "parentId",
      title: "Thuộc nhóm",
      className: "text-center",
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      className: "text-center",
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
                Thuộc tính khách hàng
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={customerAttributeBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListCustomerAttributes(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm thuộc tính" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              {!isLoading && listCustomerAttributes?.length > 0 ? (
                <Table
                  id="customerAttribute_list"
                  data={listCustomerAttributes}
                  columns={columns}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as ICustomerAttributeResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as ICustomerAttributeResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as ICustomerAttributeResponse }) : undefined,
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
                      Hiện tại chưa có thuộc tính khách hàng nào.
                      <br />
                      Hãy thêm mới thuộc tính khách hàng đầu tiên nhé!
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
      <ModalCustomerAttribute
        type={modal.type}
        shown={modalShown}
        item={modal.item as ICustomerAttributeResponse}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddCustomerAttribute : handleEditCustomerAttribute}
        onDelete={handleDeleteCustomerAttribute}
      />
    </div>
  );
}
