/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import ModalCustomer from "./partials/ModalCustomer";
import { customerBreadcrumbItems } from "../../utils/breadcrumbs";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import ExportButton from "../../components/ExportButton/ExportButton";
import Loading from "../../components/Loading/Loading";
import type { ICustomerRequest, ICustomerListRequest } from "../../model/customer/CustomerRequestModel";
import CustomerService from "../../services/CustomerService";
import type { ICustomerResponse } from "../../model/customer/CustomerResponseModel";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import ViewSwitcher from "../../components/ViewSwitcher/ViewSwitcher";
import {
  getCookie,
  runWithDelay,
  showToast,
  useCloseModal,
  useModalFade,
  useRedirectIfNoToken,
  type ModalState,
  renderAvatar,
} from "../../utils/common";

export default function CustomerGridView() {
  const [listCustomers, setListCustomers] = useState<ICustomerResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [params, setParams] = useState<ICustomerListRequest>({ page: 1, limit: 8, keyword: "" });
  const [totalItems, setTotalItems] = useState<number>(0);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const token = getCookie("token");
  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);
  const hasMore = listCustomers.length < totalItems;
  const [activeDropdownId, setActiveDropdownId] = useState<string | number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeDropdownId && !target.closest(".table-action")) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdownId]);

  useEffect(() => {
    getListCustomers();
    return () => abortController.current?.abort();
  }, [params.page, params.keyword]);

  const getListCustomers = async () => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => CustomerService.list(params, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      const newItems = result.items || [];
      setTotalItems(result.total ?? 0);
      if (params.page === 1) {
        setListCustomers(newItems);
      } else {
        setListCustomers((prev) => [...prev, ...newItems]);
      }
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleLoadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoading && hasMore) {
      setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  };

  const handleSearch = (kw: string) => {
    setParams((prev) => ({ ...prev, keyword: kw, page: 1 }));
  };

  const handleRefresh = () => {
    if (params.page === 1) {
      getListCustomers();
    } else {
      setParams((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleAddCustomer = async (payload: ICustomerRequest) => {
    setIsLoading(true);
    const response = await CustomerService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm khách hàng thành công!", "success");
      closeModal();
      handleRefresh();
    } else {
      showToast(response?.message ?? "Thêm khách hàng thất bại", "error");
      setIsLoading(false);
    }
  };

  const handleEditCustomer = async (payload: ICustomerRequest) => {
    setIsLoading(true);
    const response = await CustomerService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật khách hàng thành công!", "success");
      closeModal();
      handleRefresh();
    } else {
      showToast(response?.message ?? "Cập nhật khách hàng thất bại", "error");
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!modal.item) return;
    const customerItem = modal.item as ICustomerResponse;
    setIsLoading(true);
    const response = await CustomerService.delete(customerItem.id, token);
    if (response && response.code === 200) {
      showToast("Xóa khách hàng thành công!", "success");
      closeModal();
      handleRefresh();
    } else {
      showToast(response?.message ?? "Xóa khách hàng thất bại", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      {!headerCollapsed && <Header />}
      <Sidebar />

      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Danh sách khách hàng <span className="badge badge-soft-primary ms-2">{totalItems}</span>
              </h4>
              <Breadcrumb items={customerBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={handleRefresh} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="dropdown">
                <a href="#" className="btn btn-outline-light shadow px-2" onClick={(e) => e.preventDefault()}>
                  <i className="ti ti-filter me-2"></i>Filter <i className="ti ti-chevron-down ms-2"></i>
                </a>
              </div>
              <SearchBar placeholder="Tìm kiếm" onSearch={handleSearch} />
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <ViewSwitcher />
              <AddButton label="Thêm khách hàng" onClick={() => setModal({ type: "add" })} />
            </div>
          </div>

          <div className="row">
            {listCustomers.map((item) => (
              <div key={item.id} className="col-xxl-3 col-xl-4 col-md-6">
                <div className="card border shadow">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <a href="#" className="avatar avatar-md flex-shrink-0 me-2" onClick={(e) => e.preventDefault()}>
                          {renderAvatar(item.avatar, item.name)}
                        </a>
                        <div>
                          <h6 className="fs-14">
                            <a href="#" className="fw-medium" onClick={(e) => e.preventDefault()}>
                              {item.name}
                            </a>
                          </h6>
                          <p className="text-default mb-0 fontSize14">Customer</p>
                        </div>
                      </div>
                      <div className="dropdown table-action">
                        <a
                          href="#"
                          className={`action-icon btn btn-icon btn-sm btn-outline-light shadow ${activeDropdownId === item.id ? "show" : ""}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === item.id ? null : item.id);
                          }}
                          aria-expanded={activeDropdownId === item.id}
                        >
                          <i className="ti ti-dots-vertical"></i>
                        </a>
                        <div
                          className={`dropdown-menu ${activeDropdownId === item.id ? "show" : ""}`}
                          style={
                            activeDropdownId === item.id
                              ? { position: "absolute", inset: "0px auto auto 0px", transform: "translate3d(0px, 30px, 0px)" }
                              : {}
                          }
                        >
                          <a
                            className="dropdown-item"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setModal({ type: "edit", item: item as ICustomerRequest });
                              setActiveDropdownId(null);
                            }}
                          >
                            <i className="ti ti-edit text-blue"></i> Chỉnh sửa
                          </a>
                          <a
                            className="dropdown-item"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setModal({ type: "delete", item: item as ICustomerRequest });
                              setActiveDropdownId(null);
                            }}
                          >
                            <i className="ti ti-trash"></i> Xoá
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="d-block">
                      <div className="d-flex flex-column">
                        <p className="text-default d-inline-flex align-items-center mb-2 fontSize14">
                          <i className="ti ti-mail text-dark me-1"></i>
                          {item.email || "N/A"}
                        </p>
                        <p className="text-default d-inline-flex align-items-center mb-2 fontSize14">
                          <i className="ti ti-phone text-dark me-1"></i>
                          {item.phone || "N/A"}
                        </p>
                        <p className="text-default d-inline-flex align-items-center fontSize14">
                          <i className="ti ti-map-pin-pin text-dark me-1"></i>
                          {item.address || "N/A"}
                        </p>
                      </div>
                      <div className="d-flex align-items-center mt-2">
                        <span className="badge badge-tag badge-soft-success me-2">Active</span>
                        <span className="badge badge-tag badge-soft-warning">VIP</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                      <div className="d-flex align-items-center grid-social-links">
                        <a href="#" className="avatar avatar-xs text-dark rounded-circle me-1" onClick={(e) => e.preventDefault()}>
                          <i className="ti ti-mail fs-14"></i>
                        </a>
                        <a href="#" className="avatar avatar-xs text-dark rounded-circle me-1" onClick={(e) => e.preventDefault()}>
                          <i className="ti ti-phone-check fs-14"></i>
                        </a>
                        <a href="#" className="avatar avatar-xs text-dark rounded-circle" onClick={(e) => e.preventDefault()}>
                          <i className="ti ti-message-circle-share fs-14"></i>
                        </a>
                      </div>
                      <div className="d-flex align-items-center">
                        <a href="#" className="avatar avatar-xs" onClick={(e) => e.preventDefault()}>
                          {renderAvatar(item.avatar, item.name)}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isLoading && listCustomers.length === 0 ? (
            <div className="text-center py-5">
              <Loading />
            </div>
          ) : listCustomers.length === 0 ? (
            <div className="text-center py-5">Không tìm thấy dữ liệu.</div>
          ) : null}

          <div className="load-btn text-center mt-4 mb-4">
            {isLoading && listCustomers.length > 0 ? (
              <div className="text-center">
                <Loading />
              </div>
            ) : hasMore ? (
              <a href="#" className="btn btn-primary" onClick={handleLoadMore}>
                <i className="ti ti-loader me-1"></i> Tải thêm
              </a>
            ) : listCustomers.length > 0 ? (
              <span className="text-muted">Đã hiển thị tất cả khách hàng.</span>
            ) : null}
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
