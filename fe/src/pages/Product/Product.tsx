/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import ModalProduct from "./partials/ModalProduct";
import { productBreadcrumbItems } from "../../utils/breadcrumbs";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import ExportButton from "../../components/ExportButton/ExportButton";
import Pagination from "../../components/Pagination/Pagination";
import Loading from "../../components/Loading/Loading";
import Table from "../../components/Table/Table";
import { usePagination } from "../../hooks/usePagination";
import type { IProductRequest, IProductListRequest } from "../../model/product/ProductRequestModel";
import ProductService from "../../services/ProductService";
import type { IProductResponse } from "../../model/product/ProductResponseModel";
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

export default function Product() {
  document.title = "Danh sách sản phẩm";

  const [listProduct, setListProduct] = useState<IProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  // Params mặc định
  const [params, setParams] = useState<IProductListRequest>({
    page: 1,
    limit: 10,
    keyword: "",
  });

  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<IProductResponse[]>([]);
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
    const valView = localStorage.getItem("PRODUCT_VIEW");
    const valAdd = localStorage.getItem("PRODUCT_ADD");
    const valEdit = localStorage.getItem("PRODUCT_UPDATE");
    const valDelete = localStorage.getItem("PRODUCT_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  // Định nghĩa cột (thêm các cột chi tiết hơn)
  const [columnDefs, setColumnDefs] = useState([
    { key: "stt", title: "Số thứ tự", visible: true },
    { key: "avatar", title: "Ảnh", visible: true },
    { key: "code", title: "Mã sản phẩm", visible: true },
    { key: "name", title: "Tên sản phẩm", visible: true },
    { key: "categoryName", title: "Danh mục", visible: true },
    { key: "price", title: "Giá bán", visible: true },
    { key: "cost", title: "Giá vốn", visible: false },
    { key: "discount", title: "Giảm giá", visible: true },
    { key: "status", title: "Trạng thái", visible: true },
  ]);

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const getVisibleColumns = () => {
    const allColumns = [
      {
        key: "stt",
        title: "Số thứ tự",
        render: (_row: IProductResponse, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
        className: "w-1 text-center",
      },
      {
        key: "code",
        title: "Mã sản phẩm",
        render: (row: IProductResponse) => <span className="fw-bold text-primary">#{row.code}</span>,
        className: "align-middle",
      },
      // { key: "name", title: "Tên sản phẩm", className: "fw-semibold" },
      // {
      //   key: "avatar",
      //   title: "Ảnh",
      //   render: (row: IProductResponse) => renderAvatar(row.avatar, row.name),
      // },
      {
        key: "name",
        title: "Tên sản phẩm",
        render: (row: IProductResponse) => (
          <div className="d-flex align-items-center">
            <div className="avatar avatar-sm rounded-circle border me-2">
              <img
                src={row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || "Product")}&background=random`}
                alt={row.name}
                className="w-100 h-100 object-fit-cover rounded-circle"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || "Product")}&background=random`;
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
        render: (row: IProductResponse) => (
          <span className="fw-bold text-dark">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.price || 0)}</span>
        ),
      },
      {
        key: "cost",
        title: "Giá vốn",
        render: (row: IProductResponse) => (
          <span className="fw-bold text-dark">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.cost || 0)}</span>
        ),
      },
      {
        key: "discount",
        title: "Giảm giá",
        render: (row: IProductResponse) => {
          if (!row.discount) return "-";
          return row.discountUnit === 1
            ? `${row.discount}%`
            : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.discount);
        },
      },
      {
        key: "status",
        title: "Trạng thái",
        className: "text-center",
        render: (row: IProductResponse) =>
          row.status === 1 ? (
            <span className="badge badge-soft-success">Đang hoạt động</span>
          ) : (
            <span className="badge badge-soft-danger">Ngưng hoạt động</span>
          ),
      },
    ];

    return allColumns.filter((col) => {
      const def = columnDefs.find((c) => c.key === col.key);
      return def ? def.visible : true;
    });
  };

  useEffect(() => {
    getListProduct(params);
    return () => abortController.current?.abort();
  }, [params.page, params.limit, params.keyword]);

  const getListProduct = async (paramsSearch: IProductListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => ProductService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListProduct(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddProduct = async (payload: IProductRequest) => {
    setIsLoading(true);
    const response = await ProductService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm sản phẩm thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListProduct({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm sản phẩm thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleEditProduct = async (payload: IProductRequest) => {
    setIsLoading(true);
    const response = await ProductService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật sản phẩm thành công!", "success");
      closeModal();
      await getListProduct(params);
    } else {
      showToast(response?.message ?? "Cập nhật sản phẩm thất bại", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteProduct = async () => {
    if (!modal.item) return;
    const productItem = modal.item as IProductResponse;
    if (!productItem.id) return;
    setIsLoading(true);
    const response = await ProductService.delete(productItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listProduct.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa sản phẩm thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListProduct({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa sản phẩm thất bại", "error");
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
                Danh sách sản phẩm
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={productBreadcrumbItems} />
            </div>

            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListProduct(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            {/* Toolbar */}
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm sản phẩm" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">{/* Filter Dropdown nếu cần */}</div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
                  {/* <ViewSwitcher /> */}
                </div>
              </div>

              {!isLoading && listProduct?.length > 0 ? (
                <Table
                  id="products_list"
                  data={listProduct}
                  columns={getVisibleColumns()}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as IProductResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as IProductResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as IProductResponse }) : undefined,
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
                      Hiện tại chưa có sản phẩm nào.
                      <br />
                      Hãy thêm mới sản phẩm đầu tiên nhé!
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

      <ModalProduct
        type={modal.type}
        shown={modalShown}
        item={modal.item as IProductRequest}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddProduct : handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}
