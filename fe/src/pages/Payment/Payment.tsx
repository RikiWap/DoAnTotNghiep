import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import Table from "../../components/Table/Table";
import type { ColumnDef } from "../../components/Table/Table.types";

type PaymentItem = {
  id: number;
  invoiceId: string;
  client: string;
  clientImg?: string;
  amount: string;
  dueDate: string;
  paymentMethod: string;
  transactionId: string;
};

const mockPayments: PaymentItem[] = [
  {
    id: 1,
    invoiceId: "#274729",
    client: "NovaWave LLC",
    clientImg: "assets/img/icons/company-icon-01.svg",
    amount: "$500",
    dueDate: "21 Sep 2023",
    paymentMethod: "Credit Card",
    transactionId: "102345689",
  },
  {
    id: 2,
    invoiceId: "#274730",
    client: "BlueSky Industries",
    clientImg: "assets/img/icons/company-icon-02.svg",
    amount: "$450",
    dueDate: "15 Oct 2023",
    paymentMethod: "Cash",
    transactionId: "102345690",
  },
  {
    id: 3,
    invoiceId: "#274731",
    client: "SilverHawk",
    clientImg: "assets/img/icons/company-icon-03.svg",
    amount: "$1230",
    dueDate: "10 Nov 2023",
    paymentMethod: "Paypal",
    transactionId: "102345691",
  },
];

export default function Payments() {
  const [selectedRows, setSelectedRows] = useState<PaymentItem[]>([]);

  // State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewOffcanvas, setShowViewOffcanvas] = useState(false);
  const [currentItem, setCurrentItem] = useState<PaymentItem | null>(null);

  // 3. Định nghĩa cột cho Table
  const columns: ColumnDef<PaymentItem>[] = [
    {
      key: "invoiceId",
      title: "Mã hóa đơn",
      render: (_, value) => (
        <Link to="#" className="text-primary fw-medium" onClick={() => handleView(currentItem!)}>
          {value as string}
        </Link>
      ),
    },
    {
      key: "client",
      title: "Khách hàng",
      render: (row) => (
        <div className="d-flex align-items-center">
          {row.clientImg && (
            <Link to="#" className="avatar avatar-sm rounded-circle me-2">
              <img src={row.clientImg} alt="img" />
            </Link>
          )}
          <Link to="#" className="text-dark fw-medium">
            {row.client}
          </Link>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Số tiền",
    },
    {
      key: "dueDate",
      title: "Ngày đến hạn",
    },
    {
      key: "paymentMethod",
      title: "Phương thức thanh toán",
    },
    {
      key: "transactionId",
      title: "Mã giao dịch",
    },
  ];

  const handleView = (item: PaymentItem) => {
    setCurrentItem(item);
    setShowViewOffcanvas(true);
  };

  const handleDelete = (item: PaymentItem) => {
    setCurrentItem(item);
    setShowDeleteModal(true);
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content pb-0">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Thanh toán<span className="badge badge-soft-primary ms-2">125</span>
              </h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <Link to="/">Trang chủ</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Thanh toán
                  </li>
                </ol>
              </nav>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <div className="dropdown">
                <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                  <i className="ti ti-package-export me-2"></i>Export
                </Link>
                <div className="dropdown-menu dropdown-menu-end">
                  <ul>
                    <li>
                      <Link to="#" className="dropdown-item">
                        <i className="ti ti-file-type-pdf me-1"></i>Export as PDF
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item">
                        <i className="ti ti-file-type-xls me-1"></i>Export as Excel
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <Link to="#" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="tooltip" title="Refresh">
                <i className="ti ti-refresh"></i>
              </Link>
              <Link to="#" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="tooltip" title="Collapse" id="collapse-header">
                <i className="ti ti-transition-top"></i>
              </Link>
            </div>
          </div>
          {/* End Page Header */}

          {/* Card Start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search"></i>
                </span>
                <input type="text" className="form-control" placeholder="Search" />
              </div>
            </div>
            <div className="card-body">
              {/* Filter Section */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2"></i>Sắp xếp
                    </Link>
                    <div className="dropdown-menu">
                      <ul>
                        <li>
                          <Link to="#" className="dropdown-item">
                            Mới nhất
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            Cũ nhất
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div id="reportrange" className="reportrange-picker d-flex align-items-center shadow">
                    <i className="ti ti-calendar-due text-dark fs-14 me-1"></i>
                    <span className="reportrange-picker-field">9 Tháng 6 25 - 9 Tháng 6 25</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <Link to="#" className="btn btn-outline-light shadow px-2" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                      <i className="ti ti-filter me-2"></i>Bộ lọc<i className="ti ti-chevron-down ms-2"></i>
                    </Link>
                    <div className="filter-dropdown-menu dropdown-menu dropdown-menu-md p-0">
                      <div className="filter-header d-flex align-items-center justify-content-between border-bottom">
                        <h6 className="mb-0">
                          <i className="ti ti-filter me-1"></i>Bộ lọc
                        </h6>
                        <button type="button" className="btn-close close-filter-btn" data-bs-dismiss="dropdown" aria-label="Close"></button>
                      </div>
                      <div className="filter-set-view p-3">
                        <div className="accordion" id="accordionExample">
                          {/* Invoice ID Filter */}
                          <div className="filter-set-content">
                            <div className="filter-set-content-head">
                              <Link to="#" className="collapsed" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false">
                                Mã hóa đơn
                              </Link>
                            </div>
                            <div className="filter-set-contents accordion-collapse collapse" id="collapseThree" data-bs-parent="#accordionExample">
                              <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                <div className="mb-1">
                                  <div className="input-icon-start input-icon position-relative">
                                    <span className="input-icon-addon fs-12">
                                      <i className="ti ti-search"></i>
                                    </span>
                                    <input type="text" className="form-control form-control-md" placeholder="Search" />
                                  </div>
                                </div>
                                <ul>
                                  {["#274729", "#274730", "#274731"].map((id) => (
                                    <li key={id}>
                                      <label className="dropdown-item px-2 d-flex align-items-center">
                                        <input className="form-check-input m-0 me-1" type="checkbox" /> {id}
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          {/* Payment Amount Filter */}
                          <div className="filter-set-content">
                            <div className="filter-set-content-head">
                              <Link to="#" className="collapsed" data-bs-toggle="collapse" data-bs-target="#Status" aria-expanded="false">
                                Số tiền
                              </Link>
                            </div>
                            <div className="filter-set-contents accordion-collapse collapse" id="Status" data-bs-parent="#accordionExample">
                              <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                <ul>
                                  {["$500", "$450", "$1230"].map((amt) => (
                                    <li key={amt}>
                                      <label className="dropdown-item px-2 d-flex align-items-center">
                                        <input className="form-check-input m-0 me-1" type="checkbox" /> {amt}
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Link to="#" className="btn btn-outline-light w-100">
                            Đặt lại
                          </Link>
                          <Link to="#" className="btn btn-primary w-100">
                            Bộ lọc
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Manage Columns */}
                  <div className="dropdown">
                    <Link to="#" className="btn bg-soft-indigo px-2 border-0" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                      <i className="ti ti-columns-3 me-2"></i>Quản lý cột
                    </Link>
                    <div className="dropdown-menu dropdown-menu-md dropdown-md p-3">
                      <ul>
                        {columns.map((col, idx) => (
                          <li key={idx} className="gap-1 d-flex align-items-center mb-2">
                            <i className="ti ti-columns me-1"></i>
                            <div className="form-check form-switch w-100 ps-0">
                              <label className="form-check-label d-flex align-items-center gap-2 w-100">
                                <span>{col.title}</span>
                                <input className="form-check-input switchCheckDefault ms-auto" type="checkbox" role="switch" defaultChecked />
                              </label>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Component */}
              <Table<PaymentItem>
                id="payments-list"
                columns={columns}
                data={mockPayments}
                selectable={true}
                selectedRows={selectedRows}
                onSelect={setSelectedRows}
                actions={{
                  label: "Action",
                  onView: handleView,
                  onDelete: handleDelete,
                }}
              />

              {/* Pagination */}
              <div className="row align-items-center mt-3">
                <div className="col-md-6">
                  <div className="datatable-length"></div>
                </div>
                <div className="col-md-6">
                  <div className="datatable-paginate"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* --- Modals / Offcanvas --- */}

      {/* Preview Payment Offcanvas */}
      <div
        className={`offcanvas offcanvas-end offcanvas-large ${showViewOffcanvas ? "show" : ""}`}
        tabIndex={-1}
        id="offcanvas_view"
        style={{ visibility: showViewOffcanvas ? "visible" : "hidden" }}
      >
        <div className="offcanvas-header border-bottom justify-content-between">
          <h5 className="mb-0">
            Thanh toán cho Hóa đơn <span className="text-danger ms-2">{currentItem?.invoiceId}</span>{" "}
          </h5>
          <div className="d-flex align-items-center">
            <div className="toggle-header-popup">
              <div className="dropdown table-action me-2">
                <Link to="#" className="btn btn-dropdowns btn-outline-light dropdown-toggle" data-bs-toggle="dropdown">
                  Tải xuống
                </Link>
                <div className="dropdown-menu dropdown-menu-right">
                  <Link className="dropdown-item" to="#">
                    Tải xuống
                  </Link>
                  <Link className="dropdown-item" to="#">
                    Tải xuống PDF
                  </Link>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
              onClick={() => setShowViewOffcanvas(false)}
            >
              <i className="ti ti-x"></i>
            </button>
          </div>
        </div>
        <div className="offcanvas-body">
          {/* Nội dung chi tiết payment - Đã sửa lỗi class -> className */}
          <div className="card mb-0 shadow">
            <div className="card-body pb-3">
              <div className="details-propsal">
                <h6 className="mb-3">Đề xuất từ & đến</h6>
                <div className="row row-gap-2">
                  <div className="col-lg-6 col-12">
                    <div className="proposal-to">
                      <h6 className="mb-2 fw-semibold fs-14">CRMS</h6>
                      <p className="mb-1">3338 Marcus Street Birmingham, AL 35211</p>
                      <p className="mb-1">
                        Điện thoại : <span className="text-dark">+1 98789 78788</span>{" "}
                      </p>
                      <p className="mb-1">
                        Email :{" "}
                        <span className="text-dark">
                          <Link to="#" className="__cf_email__">
                            email@example.com
                          </Link>
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-12">
                    <div className="proposal-to">
                      <h6 className="mb-2 fw-semibold fs-14">{currentItem?.client}</h6>
                      <p className="mb-1">994 Martine Ranch Suite 900 Candacefort New Hampshire</p>
                      <p className="mb-1">
                        Điện thoại : <span className="text-dark">+1 58478 74646</span>
                      </p>
                      <p className="mb-1">
                        Email :{" "}
                        <span className="text-dark">
                          <Link to="#" className="__cf_email__">
                            email@example.com
                          </Link>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              <div className="details-propsal details-propsals border-bottom pb-3 mb-3">
                <h6 className="mb-3">Chi tiết thanh toán</h6>
                <ul className="d-flex align-items-centers justify-content-between gap-2 flex-wrap">
                  <li>
                    <p className="fs-13 fw-medium mb-1">Ngày thanh toán</p>
                    <h6 className="fs-14 fw-normal">13 May 2024</h6>
                  </li>
                  <li>
                    <p className="fs-13 fw-medium mb-1">Phương thức thanh toán</p>
                    <h6 className="fs-14 fw-normal">{currentItem?.paymentMethod}</h6>
                  </li>
                  <li>
                    <p className="fs-13 fw-medium mb-1">Tổng số tiền</p>
                    <h6 className="fs-14 fw-normal">{currentItem?.amount}</h6>
                  </li>
                </ul>
              </div>
              <div className="details-propsal">
                <div className="d-flex align-items-center justify-content-between">
                  <h6 className="mb-3">Chi tiết hóa đơn</h6>
                  <h6 className="d-flex fs-14 fw-normal">
                    <span className="text-danger"> Số tiền phải trả : </span> $100
                  </h6>
                </div>
                <ul className="m-0 border-0 d-flex align-items-centers justify-content-between gap-2 flex-wrap">
                  <li>
                    <p className="fs-13 fw-medium mb-1">Số hóa đơn</p>
                    <h6 className="mb-0">
                      <span className="badge badge-soft-danger d-inline-flex">{currentItem?.invoiceId}</span>
                    </h6>
                  </li>
                  <li>
                    <p className="fs-13 fw-medium mb-1">Ngày hóa đơn</p>
                    <h6 className="fs-14 fw-normal">13 May 2024</h6>
                  </li>
                  <li>
                    <p className="fs-13 fw-medium mb-1">Số tiền hóa đơn</p>
                    <h6 className="fs-14 fw-normal">$196</h6>
                  </li>
                  <li>
                    <p className="fs-13 fw-medium mb-1">Số tiền thanh toán</p>
                    <h6 className="fs-14 fw-normal">{currentItem?.amount}</h6>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showViewOffcanvas && <div className="offcanvas-backdrop fade show" onClick={() => setShowViewOffcanvas(false)}></div>}

      {/* Delete Modal */}
      <div className={`modal fade ${showDeleteModal ? "show d-block" : ""}`} id="delete_payments" tabIndex={-1} aria-hidden={!showDeleteModal}>
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24"></i>
                </span>
              </div>
              <h5 className="mb-1">Xác nhận xóa</h5>
              <p className="mb-3">Bạn có chắc chắn muốn xóa hóa đơn {currentItem?.invoiceId}?</p>
              <div className="d-flex justify-content-center">
                <button className="btn btn-light position-relative z-1 me-2 w-100" onClick={() => setShowDeleteModal(false)}>
                  Hủy
                </button>
                <button className="btn btn-primary position-relative z-1 w-100" onClick={() => setShowDeleteModal(false)}>
                  Có, Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}
