/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import Table from "../../components/Table/Table";
import Pagination from "../../components/Pagination/Pagination";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import SearchBar from "../../components/SearchBar/SearchBar";
import type { ColumnDef } from "../../components/Table/Table.types";
import { callHistoryBreadcrumbItems } from "../../utils/breadcrumbs";
import Modal from "bootstrap/js/dist/modal";
import Offcanvas from "bootstrap/js/dist/offcanvas";
// 1. Định nghĩa Type
interface ICallHistory extends Record<string, unknown> {
  id: number;
  username: string;
  avatar: string;
  phoneNumber: string;
  callType: "Video" | "Audio";
  direction: "Incoming" | "Outgoing" | "Missed"; // Đến, Đi, Nhỡ
  date: string;
  duration: string;
  satisfaction: number; // 1-5 sao
}

// 2. Mock Data
const mockCallHistory: ICallHistory[] = [
  {
    id: 1,
    username: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=11",
    phoneNumber: "+84 987 654 321",
    callType: "Video",
    direction: "Incoming",
    date: "25 Th9 2023, 10:30 SA",
    duration: "12 phút 30 giây",
    satisfaction: 5,
  },
  {
    id: 2,
    username: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=5",
    phoneNumber: "+84 912 345 678",
    callType: "Audio",
    direction: "Outgoing",
    date: "26 Th9 2023, 02:15 CH",
    duration: "05 phút 10 giây",
    satisfaction: 4,
  },
  {
    id: 3,
    username: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=3",
    phoneNumber: "+84 909 090 909",
    callType: "Audio",
    direction: "Missed",
    date: "27 Th9 2023, 09:00 SA",
    duration: "00 phút 00 giây",
    satisfaction: 1,
  },
  {
    id: 4,
    username: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/150?img=9",
    phoneNumber: "+84 999 888 777",
    callType: "Video",
    direction: "Outgoing",
    date: "28 Th9 2023, 04:45 CH",
    duration: "20 phút 05 giây",
    satisfaction: 5,
  },
  {
    id: 5,
    username: "Hoàng Văn E",
    avatar: "https://i.pravatar.cc/150?img=12",
    phoneNumber: "+84 888 666 555",
    callType: "Audio",
    direction: "Incoming",
    date: "29 Th9 2023, 11:20 SA",
    duration: "08 phút 45 giây",
    satisfaction: 3,
  },
];

export default function CallHistory() {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selectedRows, setSelectedRows] = useState<ICallHistory[]>([]);

  // State cho Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItem: mockCallHistory.length,
  });

  // Helper render sao (Mức độ hài lòng)
  const renderStars = (count: number) => {
    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <i key={index} className={`ti ti-star-filled fs-14 ${index < count ? "text-warning" : "text-muted opacity-25"}`}></i>
        ))}
      </div>
    );
  };

  // Helper render loại cuộc gọi
  const renderDirection = (direction: string) => {
    switch (direction) {
      case "Incoming":
        return (
          <span className="badge badge-soft-success">
            <i className="ti ti-arrow-down-left me-1"></i>Cuộc gọi đến
          </span>
        );
      case "Outgoing":
        return (
          <span className="badge badge-soft-info">
            <i className="ti ti-arrow-up-right me-1"></i>Cuộc gọi đi
          </span>
        );
      case "Missed":
        return (
          <span className="badge badge-soft-danger">
            <i className="ti ti-phone-x me-1"></i>Cuộc gọi nhỡ
          </span>
        );
      default:
        return null;
    }
  };

  // 3. Cấu hình cột Table
  const columns: ColumnDef<ICallHistory>[] = [
    {
      key: "username",
      title: "Người dùng",
      render: (row) => (
        <h2 className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-sm rounded-circle border me-2">
            <img src={row.avatar} alt="User" className="w-100 h-100 object-fit-cover rounded-circle" />
          </Link>
          <div className="d-flex flex-column">
            <Link to="#" className="fs-14 fw-medium text-dark text-decoration-none">
              {row.username}
            </Link>
            <span className="text-muted fs-12">{row.phoneNumber}</span>
          </div>
        </h2>
      ),
    },
    {
      key: "callType",
      title: "Loại hình",
      render: (row) => (
        <div className="d-flex align-items-center text-dark">
          <span
            className={`avatar avatar-xs rounded-circle me-2 ${row.callType === "Video" ? "bg-soft-primary text-primary" : "bg-soft-success text-success"}`}
          >
            <i className={`ti ${row.callType === "Video" ? "ti-video" : "ti-phone"}`}></i>
          </span>
          {row.callType === "Video" ? "Video Call" : "Audio Call"}
        </div>
      ),
    },
    {
      key: "direction",
      title: "Trạng thái",
      render: (row) => renderDirection(row.direction),
    },
    {
      key: "date",
      title: "Thời gian",
    },
    {
      key: "duration",
      title: "Thời lượng",
    },
    {
      key: "satisfaction",
      title: "Mức độ hài lòng",
      render: (row) => renderStars(row.satisfaction),
    },
  ];

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
                Lịch sử cuộc gọi <span className="badge badge-soft-primary ms-2">{mockCallHistory.length}</span>
              </h4>
              <Breadcrumb items={callHistoryBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <button className="btn btn-icon btn-outline-light shadow" title="Làm mới">
                <i className="ti ti-refresh"></i>
              </button>
              <button className="btn btn-icon btn-outline-light shadow" title="Thu gọn" onClick={() => setHeaderCollapsed(!headerCollapsed)}>
                <i className="ti ti-transition-top"></i>
              </button>
            </div>
          </div>
          {/* End Page Header */}

          {/* Card Start */}
          <div className="card border-0 rounded-0 shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap bg-white border-bottom">
              <SearchBar placeholder="Tìm kiếm cuộc gọi..." />
              <button
                className="btn btn-primary d-flex align-items-center"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvas_add_call"
              >
                <i className="ti ti-plus me-1"></i>Thêm cuộc gọi
              </button>
            </div>
            <div className="card-body">
              {/* Filter Section */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <a
                      href="#"
                      className="dropdown-toggle btn btn-outline-light px-3 py-2 shadow-sm d-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-sort-ascending-2 me-2"></i>Sắp xếp
                    </a>
                    <div className="dropdown-menu">
                      <ul>
                        <li>
                          <a href="#" className="dropdown-item">
                            Mới nhất
                          </a>
                        </li>
                        <li>
                          <a href="#" className="dropdown-item">
                            Cũ nhất
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="input-group shadow-sm" style={{ width: "250px" }}>
                    <span className="input-group-text bg-white border-end-0">
                      <i className="ti ti-calendar-event"></i>
                    </span>
                    <input type="text" className="form-control border-start-0 ps-0" placeholder="Chọn ngày..." />
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Filter Dropdown */}
                  <div className="dropdown">
                    <a href="#" className="btn btn-outline-light shadow-sm px-3 py-2" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                      <i className="ti ti-filter me-2"></i>Bộ lọc
                    </a>
                    <div className="dropdown-menu dropdown-menu-end p-3" style={{ width: "300px" }}>
                      <h6 className="mb-3 border-bottom pb-2">Lọc theo</h6>
                      <div className="mb-3">
                        <label className="form-label">Loại cuộc gọi</label>
                        <select className="form-select">
                          <option>Tất cả</option>
                          <option>Video</option>
                          <option>Audio</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Trạng thái</label>
                        <select className="form-select">
                          <option>Tất cả</option>
                          <option>Cuộc gọi đến</option>
                          <option>Cuộc gọi đi</option>
                          <option>Cuộc gọi nhỡ</option>
                        </select>
                      </div>
                      <button className="btn btn-primary w-100">Áp dụng</button>
                    </div>
                  </div>

                  {/* View Mode */}
                  <div className="d-flex align-items-center shadow-sm p-1 rounded border bg-light">
                    <a href="#" className="btn btn-sm p-1 border-0 fs-14 bg-white shadow-sm text-primary">
                      <i className="ti ti-list"></i>
                    </a>
                    <a href="#" className="btn btn-sm p-1 border-0 ms-1 fs-14 text-muted">
                      <i className="ti ti-grid-dots"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Table */}
              <Table
                id="call-history-table"
                data={mockCallHistory}
                columns={columns}
                selectable={true}
                selectedRows={selectedRows}
                onSelect={setSelectedRows as any}
                actions={{
                  label: "Hành động",
                  onEdit: () => {
                    const offcanvasEl = document.getElementById("offcanvas_edit_call");
                    if (offcanvasEl) {
                      const bsOffcanvas = new Offcanvas(offcanvasEl);
                      bsOffcanvas.show();
                    }
                  },
                  onDelete: () => {
                    const modalEl = document.getElementById("delete_call_modal");
                    if (modalEl) {
                      const bsModal = new Modal(modalEl);
                      bsModal.show();
                    }
                  },
                }}
              />

              {/* Pagination */}
              <div className="mt-4">
                <Pagination
                  total={pagination.totalItem}
                  page={pagination.page}
                  perPage={pagination.limit}
                  onPageChange={(p) => setPagination({ ...pagination, page: p })}
                  onPerPageChange={(l) => setPagination({ ...pagination, limit: l, page: 1 })}
                />
              </div>
            </div>
          </div>
          {/* End Card */}
        </div>

        <Footer />
      </div>

      {/* --- Modals & Offcanvas Section --- */}

      {/* Add Call Offcanvas */}
      <div className="offcanvas offcanvas-end offcanvas-large" tabIndex={-1} id="offcanvas_add_call">
        <div className="offcanvas-header border-bottom bg-light">
          <h5 className="mb-0 fw-semibold">
            <i className="ti ti-phone-plus me-2 text-primary"></i>Thêm cuộc gọi mới
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label fw-medium">
                  Tên người dùng <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" placeholder="Nhập tên người dùng" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Số điện thoại <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" placeholder="Nhập số điện thoại" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Loại cuộc gọi</label>
                <select className="form-select">
                  <option>Audio Call</option>
                  <option>Video Call</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Trạng thái</label>
                <select className="form-select">
                  <option>Cuộc gọi đến</option>
                  <option>Cuộc gọi đi</option>
                  <option>Cuộc gọi nhỡ</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Thời gian</label>
                <input type="datetime-local" className="form-control" />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-medium">Thời lượng</label>
                <input type="text" className="form-control" placeholder="Ví dụ: 10 phút 30 giây" />
              </div>
              {/* Satisfaction Input */}
              <div className="col-md-12">
                <label className="form-label fw-medium">Mức độ hài lòng</label>
                <div className="rating-select d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="form-check form-check-inline m-0">
                      <input className="form-check-input d-none" type="radio" name="satisfaction" id={`star_${star}`} value={star} />
                      <label className="form-check-label cursor-pointer" htmlFor={`star_${star}`}>
                        <i className="ti ti-star fs-20 text-muted hover-warning"></i>
                      </label>
                    </div>
                  ))}
                  <span className="text-muted fs-12 ms-2">(Chọn số sao)</span>
                </div>
              </div>
              <div className="col-md-12">
                <label className="form-label fw-medium">Ghi chú</label>
                <textarea className="form-control" rows={3} placeholder="Nội dung cuộc gọi..."></textarea>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end mt-4 pt-3 border-top">
              <button type="button" className="btn btn-light me-2" data-bs-dismiss="offcanvas">
                Hủy
              </button>
              <button type="button" className="btn btn-primary">
                Lưu cuộc gọi
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Call Offcanvas */}
      <div className="offcanvas offcanvas-end offcanvas-large" tabIndex={-1} id="offcanvas_edit_call">
        <div className="offcanvas-header border-bottom bg-light">
          <h5 className="mb-0 fw-semibold">
            <i className="ti ti-edit me-2 text-info"></i>Chỉnh sửa cuộc gọi
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label fw-medium">
                  Tên người dùng <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" placeholder="Nhập tên người dùng" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">
                  Số điện thoại <span className="text-danger">*</span>
                </label>
                <input type="text" className="form-control" placeholder="Nhập số điện thoại" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Loại cuộc gọi</label>
                <select className="form-select">
                  <option>Audio Call</option>
                  <option>Video Call</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Trạng thái</label>
                <select className="form-select">
                  <option>Cuộc gọi đến</option>
                  <option>Cuộc gọi đi</option>
                  <option>Cuộc gọi nhỡ</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Thời gian</label>
                <input type="datetime-local" className="form-control" />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-medium">Thời lượng</label>
                <input type="text" className="form-control" placeholder="Ví dụ: 10 phút 30 giây" />
              </div>
              {/* Satisfaction Input */}
              <div className="col-md-12">
                <label className="form-label fw-medium">Mức độ hài lòng</label>
                <div className="rating-select d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="form-check form-check-inline m-0">
                      <input className="form-check-input d-none" type="radio" name="satisfaction" id={`star_${star}`} value={star} />
                      <label className="form-check-label cursor-pointer" htmlFor={`star_${star}`}>
                        <i className="ti ti-star fs-20 text-muted hover-warning"></i>
                      </label>
                    </div>
                  ))}
                  <span className="text-muted fs-12 ms-2">(Chọn số sao)</span>
                </div>
              </div>
              <div className="col-md-12">
                <label className="form-label fw-medium">Ghi chú</label>
                <textarea className="form-control" rows={3} placeholder="Nội dung cuộc gọi..."></textarea>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end mt-4 pt-3 border-top">
              <button type="button" className="btn btn-light me-2" data-bs-dismiss="offcanvas">
                Hủy
              </button>
              <button type="button" className="btn btn-primary">
                Lưu cuộc gọi
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete_call_modal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content shadow-lg border-0 rounded-3">
            <div className="modal-body p-4 text-center">
              <div className="mb-3">
                <span className="avatar avatar-xl bg-soft-danger text-danger rounded-circle">
                  <i className="ti ti-trash fs-36"></i>
                </span>
              </div>
              <h5 className="mb-2 fw-bold">Xác nhận xóa?</h5>
              <p className="mb-4 text-muted">Bạn có chắc chắn muốn xóa nhật ký cuộc gọi này không? Hành động này không thể hoàn tác.</p>
              <div className="d-flex justify-content-center gap-2">
                <button type="button" className="btn btn-light w-100" data-bs-dismiss="modal">
                  Hủy
                </button>
                <button type="button" className="btn btn-danger w-100">
                  Xóa ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
