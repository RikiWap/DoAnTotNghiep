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
import { resourceBreadcrumbItems } from "../../utils/breadcrumbs";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import Pagination from "../../components/Pagination/Pagination";
import ResourceService from "../../services/ResourcesService";
import type { IResourceItem } from "../../model/resources/ResourcesResponseModel";
import type { IResourceUpdateRequest, IResourceListRequest } from "../../model/resources/ResourcesRequestModel";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../components/Loading/Loading";
import ModalResource from "./partials/ModalResource";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import { useRedirectIfNoToken, useModalFade, useCloseModal } from "../../utils/common";
import type { ModalState } from "../../utils/common";

export default function Resources() {
  const [listResources, setListResources] = useState<IResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const [params, setParams] = useState<IResourceListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<IResourceItem[]>([]);
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
    const valView = localStorage.getItem("RESOURCE_VIEW");
    const valAdd = localStorage.getItem("RESOURCE_ADD");
    const valEdit = localStorage.getItem("RESOURCE_UPDATE");
    const valDelete = localStorage.getItem("RESOURCE_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  useEffect(() => {
    getListResources(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListResources = async (paramsSearch: IResourceListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => ResourceService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListResources(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddResource = async (payload: IResourceUpdateRequest) => {
    setIsLoading(true);
    const response = await ResourceService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm tài nguyên thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListResources({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm tài nguyên thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditResource = async (payload: IResourceUpdateRequest) => {
    setIsLoading(true);
    const response = await ResourceService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật tài nguyên thành công!", "success");
      closeModal();
      await getListResources(params);
    } else {
      showToast(response?.message ?? "Cập nhật tài nguyên thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteResource = async () => {
    if (!modal.item) return;
    const resourceItem = modal.item as IResourceItem;
    setIsLoading(true);
    const response = await ResourceService.delete(resourceItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listResources.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa tài nguyên thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListResources({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa tài nguyên thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const columns = [
    {
      key: "stt",
      title: "Số thứ tự",
      render: (_row: IResourceItem, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
      className: "w-1 text-center",
    },
    {
      key: "name",
      title: "Tên tài nguyên",
    },
    {
      key: "description",
      title: "Mô tả",
    },
    {
      key: "code",
      title: "Code",
    },
    {
      key: "uri",
      title: "URI",
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
                Tài nguyên
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={resourceBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListResources(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm tài nguyên" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              {!isLoading && listResources?.length > 0 ? (
                <Table
                  id="roles_list"
                  data={listResources}
                  columns={columns}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as IResourceItem }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as IResourceItem }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as IResourceItem }) : undefined,
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
                      Hiện tại chưa có tài nguyên nào.
                      <br />
                      Hãy thêm mới tài nguyên đầu tiên nhé!
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
      <ModalResource
        type={modal.type}
        shown={modalShown}
        item={modal.item as IResourceItem}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddResource : handleEditResource}
        onDelete={handleDeleteResource}
      />
    </div>
  );
}
