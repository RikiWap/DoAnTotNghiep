/* eslint-disable @typescript-eslint/no-unused-vars */
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
import ModalCategory from "./partials/ModalCategory";

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

import CategoryService from "../../services/CategoryService";
import type { ICategoryRequest, ICategoryListRequest } from "../../model/category/CategoryRequestModel";
import type { ICategoryResponse } from "../../model/category/CategoryResponseModel";
import { categoryBreadcrumbItems } from "../../utils/breadcrumbs";

export default function Category() {
  document.title = "Quản lý danh mục";

  const [listCategory, setListCategory] = useState<ICategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const [params, setParams] = useState<ICategoryListRequest>({
    page: 1,
    limit: 10,
    keyword: "",
  });

  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<ICategoryResponse[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: null, item: undefined });
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
    const valView = localStorage.getItem("CATEGORY_ITEM_VIEW");
    const valAdd = localStorage.getItem("CATEGORY_ITEM_ADD");
    const valEdit = localStorage.getItem("CATEGORY_ITEM_UPDATE");
    const valDelete = localStorage.getItem("CATEGORY_ITEM_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  const [columnDefs, setColumnDefs] = useState([
    { key: "stt", title: "Số thứ tự", visible: true },
    { key: "name", title: "Tên danh mục", visible: true },
    { key: "type", title: "Loại", visible: true },
    { key: "parentId", title: "Danh mục cha", visible: true },
    { key: "position", title: "Thứ tự", visible: true },
    { key: "active", title: "Trạng thái", visible: true },
  ]);

  const handleToggleStatus = async (category: ICategoryResponse) => {
    const prevCategory = [...listCategory];
    const newStatus = Number(category.active) === 1 ? 0 : 1;

    setListCategory((prev) => prev.map((item) => (item.id === category.id ? { ...item, active: newStatus } : item)));

    const response = await CategoryService.updateStatus(category.id, newStatus, token);
    if (response && response.code === 200) {
      showToast("Đổi trạng thái thành công!", "success");
      CategoryService.list(params, token).then((res) => {
        if (res && res.code === 200) {
          setListCategory(res.result.items || []);
        }
      });
    } else {
      showToast(response?.message ?? "Đổi trạng thái thất bại. Vui lòng thử lại!", "error");
      setListCategory(prevCategory);
    }
  };

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const getVisibleColumns = () => {
    const allColumns = [
      {
        key: "stt",
        title: "Số thứ tự",
        render: (_row: ICategoryResponse, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
        className: "w-1 text-center",
      },
      {
        key: "name",
        title: "Tên danh mục",
        render: (row: ICategoryResponse) => (
          <div className="d-flex align-items-center">
            <div className="avatar avatar-sm rounded-circle border me-2">
              <img
                src={row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`}
                alt={row.name}
                className="w-100 h-100 object-fit-cover rounded-circle"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`;
                }}
              />
            </div>
            <span className="fw-semibold">{row.name}</span>
          </div>
        ),
      },
      {
        key: "type",
        title: "Loại",
        render: (row: ICategoryResponse) => (
          <span className={`badge ${row.type === 1 ? "badge-soft-info" : "badge-soft-warning"}`}>{row.type === 1 ? "Dịch vụ" : "Sản phẩm"}</span>
        ),
      },
      {
        key: "parentId",
        title: "Danh mục cha",
        render: (row: ICategoryResponse) => <span className="text-muted">{row.parentId === 0 ? "Danh mục gốc" : `ID: ${row.parentId}`}</span>,
      },
      {
        key: "position",
        title: "Thứ tự",
        className: "text-center",
        render: (row: ICategoryResponse) => row.position,
      },
      {
        key: "active",
        title: "Trạng thái",
        className: "text-center",
        render: (row: ICategoryResponse) => (
          <span
            className={Number(row.active) === 1 ? "badge badge-soft-success" : "badge badge-soft-danger"}
            style={{ cursor: "pointer" }}
            onClick={() => handleToggleStatus(row)}
          >
            {Number(row.active) === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
          </span>
        ),
      },
    ];
    return allColumns.filter((col) => {
      const def = columnDefs.find((c) => c.key === col.key);
      return def ? def.visible : true;
    });
  };

  const getListCategory = async (paramsSearch: ICategoryListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => CategoryService.list(paramsSearch, token, abortController.current?.signal), 500);

    if (response && response.code === 200) {
      const result = response.result;
      setListCategory(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getListCategory(params);
    return () => abortController.current?.abort();
  }, [params.page, params.limit, params.keyword]);

  const handleAdd = async (payload: ICategoryRequest) => {
    setIsLoading(true);
    const response = await CategoryService.update(payload, token || "");
    if (response && response.code === 200) {
      showToast("Thêm danh mục thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListCategory({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleEdit = async (payload: ICategoryRequest) => {
    setIsLoading(true);
    const response = await CategoryService.update(payload, token || "");
    if (response && response.code === 200) {
      showToast("Cập nhật danh mục thành công!", "success");
      closeModal();
      await getListCategory(params);
    } else {
      showToast(response?.message ?? "Cập nhật thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    const item = modal.item as ICategoryResponse;
    if (!item?.id) return;
    setIsLoading(true);
    const response = await CategoryService.delete(item.id, token || "");
    const safePage = params.page ?? 1;
    const newPage = listCategory.length === 1 && safePage > 1 ? safePage - 1 : safePage;

    if (response && response.code === 200) {
      showToast("Xóa danh mục thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListCategory({ ...params, page: newPage });
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
                Danh sách danh mục
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={categoryBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <RefreshButton onRefresh={() => getListCategory(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm danh mục" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div />
                <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
              </div>

              {!isLoading && listCategory?.length > 0 ? (
                <Table
                  id="category_list"
                  data={listCategory}
                  columns={getVisibleColumns()}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as ICategoryResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as ICategoryResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as ICategoryResponse }) : undefined,
                  }}
                />
              ) : isLoading ? (
                <div className="text-center py-5">
                  <Loading />
                </div>
              ) : (
                <div className="text-center py-5">{isNoItem ? "Chưa có danh mục nào." : "Không tìm thấy dữ liệu."}</div>
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

      <ModalCategory
        type={modal.type}
        shown={modalShown}
        item={modal.item as ICategoryResponse}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAdd : handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
