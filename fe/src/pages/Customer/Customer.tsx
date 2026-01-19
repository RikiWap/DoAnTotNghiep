/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import ModalCustomer from "./partials/ModalCustomer";
import { customerBreadcrumbItems } from "../../utils/breadcrumbs";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import ExportButton from "../../components/ExportButton/ExportButton";
import Pagination from "../../components/Pagination/Pagination";
import Loading from "../../components/Loading/Loading";
import Table from "../../components/Table/Table";
import { usePagination } from "../../hooks/usePagination";
import type { ICustomerRequest, ICustomerListRequest } from "../../model/customer/CustomerRequestModel";
import CustomerService from "../../services/CustomerService";
import type { ICustomerResponse, ICustomerExtraInfo } from "../../model/customer/CustomerResponseModel";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
// import ViewSwitcher from "../../components/ViewSwitcher/ViewSwitcher";
import ManageColumns from "../../components/ManageColumns/ManageColumns";
import CustomerAttributeService from "../../services/CustomerAttributeService";
import type { ICustomerAttributeResponse } from "../../model/customerAttribute/CustomerAttributeResponseModel";
import {
  getCookie,
  runWithDelay,
  showToast,
  useCloseModal,
  useModalFade,
  useRedirectIfNoToken,
  type ModalState,
  formatDateTime,
  renderIndex,
} from "../../utils/common";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";

export default function Customers() {
  document.title = "Danh sách khách hàng";

  const [listCustomers, setListCustomers] = useState<ICustomerResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [params, setParams] = useState<ICustomerListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<ICustomerResponse[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const token = getCookie("token");
  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);

  // State lưu danh sách các attribute động
  const [dynamicAttributes, setDynamicAttributes] = useState<ICustomerAttributeResponse[]>([]);

  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  useEffect(() => {
    const valView = localStorage.getItem("CUSTOMER_VIEW");
    const valAdd = localStorage.getItem("CUSTOMER_ADD");
    const valEdit = localStorage.getItem("CUSTOMER_UPDATE");
    const valDelete = localStorage.getItem("CUSTOMER_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  // Định nghĩa các cột tĩnh (cố định)
  const staticColumns = [
    { key: "stt", title: "Số thứ tự", visible: true },
    { key: "avatar", title: "Ảnh đại diện", visible: true },
    { key: "name", title: "Tên khách hàng", visible: true },
    { key: "phone", title: "Số điện thoại", visible: true },
    { key: "email", title: "Email", visible: true },
    { key: "address", title: "Địa chỉ", visible: true },
    { key: "createdTime", title: "Ngày tạo", visible: true },
    { key: "updatedTime", title: "Ngày cập nhật", visible: true },
    { key: "lastestContact", title: "Liên hệ gần nhất", visible: true },
  ];

  const [columnDefs, setColumnDefs] = useState(staticColumns);

  // Effect: Lấy danh sách Attributes khi component mount
  useEffect(() => {
    const fetchAttributes = async () => {
      const controller = new AbortController();
      try {
        const res = await CustomerAttributeService.listChildren(token, controller.signal);
        if (res && res.code === 200) {
          const items = res.result?.items ?? res.result ?? [];
          setDynamicAttributes(items);

          // Merge cột tĩnh và cột động vào columnDefs
          const dynamicCols = items.map((attr: ICustomerAttributeResponse) => ({
            key: `attr_${attr.id}`, // Tạo key duy nhất
            title: attr.name,
            visible: true, // Mặc định hiển thị hoặc false tuỳ bạn
          }));

          setColumnDefs([...staticColumns, ...dynamicCols]);
        }
      } catch (err) {
        console.error("Failed to fetch attributes", err);
      }
    };
    fetchAttributes();
  }, []); // Chạy 1 lần

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const getVisibleColumns = () => {
    const staticRenderMap = [
      {
        key: "stt",
        title: "Số thứ tự",
        render: (_row: ICustomerResponse, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
        className: "w-1",
      },
      {
        key: "name",
        title: "Tên khách hàng",
        render: (row: ICustomerResponse) => (
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
            <span className="fs-14">{row.name}</span>
          </div>
        ),
      },
      { key: "phone", title: "Số điện thoại" },
      { key: "email", title: "Email" },
      { key: "address", title: "Địa chỉ" },
      {
        key: "createdTime",
        title: "Ngày tạo",
        render: (row: ICustomerResponse) => formatDateTime(row.createdTime),
      },
      {
        key: "updatedTime",
        title: "Ngày cập nhật",
        render: (row: ICustomerResponse) => formatDateTime(row.updatedTime),
      },
      {
        key: "lastestContact",
        title: "Liên hệ gần nhất",
        render: (row: ICustomerResponse) => formatDateTime(row.lastestContact),
      },
    ];

    // 2. Định nghĩa render cho các cột động
    const dynamicRenderMap = dynamicAttributes.map((attr) => ({
      key: `attr_${attr.id}`,
      title: attr.name,
      render: (row: ICustomerResponse) => {
        // Tìm giá trị trong customerExtraInfos (Cần đảm bảo Backend trả về field này trong list)
        // Dùng `any` ép kiểu tạm nếu interface ICustomerResponse chưa có customerExtraInfos
        const extraInfos = (row as any).customerExtraInfos as ICustomerExtraInfo[] | undefined;

        if (!extraInfos) return "";

        const info = extraInfos.find((x) => x.attributeId === attr.id);

        if (!info) return "";

        // Xử lý hiển thị đặc biệt nếu cần (ví dụ attribute là file ảnh, date, v.v.)
        if (attr.datatype === "attachment" && info.attributeValue) {
          return (
            <a href={info.attributeValue} target="_blank" rel="noreferrer">
              Xem file
            </a>
          );
        }

        return info.attributeValue;
      },
    }));

    const allColumnsRender = [...staticRenderMap, ...dynamicRenderMap];

    // 3. Filter dựa trên visible state
    return allColumnsRender.filter((col) => {
      const def = columnDefs.find((c) => c.key === col.key);
      return def ? def.visible : true;
    });
  };

  useEffect(() => {
    getListCustomers(params);
    return () => abortController.current?.abort();
  }, [params.page, params.limit, params.keyword]);

  const getListCustomers = async (paramsSearch: ICustomerListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => CustomerService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListCustomers(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  // ... (Các hàm handleAdd, handleEdit, handleDelete giữ nguyên như cũ)
  const handleAddCustomer = async (payload: ICustomerRequest) => {
    setIsLoading(true);
    const response = await CustomerService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm khách hàng thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListCustomers({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm khách hàng thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditCustomer = async (payload: ICustomerRequest) => {
    setIsLoading(true);
    const response = await CustomerService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật khách hàng thành công!", "success");
      closeModal();
      await getListCustomers(params);
    } else {
      showToast(response?.message ?? "Cập nhật khách hàng thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteCustomer = async () => {
    if (!modal.item) return;
    const customerItem = modal.item as ICustomerResponse;
    setIsLoading(true);
    const response = await CustomerService.delete(customerItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listCustomers.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa khách hàng thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListCustomers({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa khách hàng thất bại. Vui lòng thử lại!", "error");
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
                Danh sách khách hàng
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={customerBreadcrumbItems} />
            </div>

            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListCustomers(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm khách hàng" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap"></div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Truyền columnDefs mới đã bao gồm trường động vào đây */}
                  <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
                  {/* <ViewSwitcher /> */}
                </div>
              </div>

              {!isLoading && listCustomers?.length > 0 ? (
                <Table
                  id="customers_list"
                  data={listCustomers}
                  columns={getVisibleColumns()} // Hàm này giờ đã trả về cả cột động
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as ICustomerResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as ICustomerResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as ICustomerResponse }) : undefined,
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
                      Hiện tại chưa có người dùng nào.
                      <br />
                      Hãy thêm mới người dùng đầu tiên nhé!
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

      <ModalCustomer
        type={modal.type}
        shown={modalShown}
        item={modal.item as ICustomerResponse}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddCustomer : handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />
    </div>
  );
}
