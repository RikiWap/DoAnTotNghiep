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
import { pointHistoryBreadcrumbItems } from "../../utils/breadcrumbs";

// 1. Định nghĩa Type
interface IPointHistory extends Record<string, any> {
  id: number;
  customerName: string;
  avatar: string;
  phone: string;
  currentPoints: number;
  accumulatedPoints: number;
  membershipTier: "Standard" | "Silver" | "Gold" | "Platinum" | "Diamond";
  changedPoints: number;
  transactionType: string;
  date: string;
}

// 2. Mock Data
const mockPointHistory: IPointHistory[] = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=11",
    phone: "0987 654 321",
    currentPoints: 1250,
    accumulatedPoints: 1500,
    membershipTier: "Silver",
    changedPoints: 5,
    transactionType: "Check-in hàng ngày",
    date: "25 Th9 2023, 10:30 SA",
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=5",
    phone: "0912 345 678",
    currentPoints: 5400,
    accumulatedPoints: 12000,
    membershipTier: "Diamond",
    changedPoints: 150,
    transactionType: "Mua đơn hàng #DH001",
    date: "26 Th9 2023, 02:15 CH",
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=3",
    phone: "0909 090 909",
    currentPoints: 850,
    accumulatedPoints: 900,
    membershipTier: "Standard",
    changedPoints: -500,
    transactionType: "Đổi voucher 50k",
    date: "27 Th9 2023, 09:00 SA",
  },
  {
    id: 4,
    customerName: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/150?img=9",
    phone: "0999 888 777",
    currentPoints: 2100,
    accumulatedPoints: 5500,
    membershipTier: "Gold",
    changedPoints: 20,
    transactionType: "Đánh giá sản phẩm",
    date: "28 Th9 2023, 04:45 CH",
  },
  {
    id: 5,
    customerName: "Hoàng Văn E",
    avatar: "https://i.pravatar.cc/150?img=12",
    phone: "0888 666 555",
    currentPoints: 90,
    accumulatedPoints: 90,
    membershipTier: "Standard",
    changedPoints: -50,
    transactionType: "Đổi quà tặng",
    date: "29 Th9 2023, 11:20 SA",
  },
];

export default function PointHistory() {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selectedRows, setSelectedRows] = useState<IPointHistory[]>([]);

  // State quản lý Dropdown & Date Picker
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); // State lưu ngày chọn

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItem: mockPointHistory.length,
  });

  // Helper: Xử lý màu sắc cho điểm thay đổi
  const renderPointChange = (points: number) => {
    let badgeClass = "";
    let icon = "";

    if (points > 0) {
      if (points <= 10) {
        badgeClass = "badge-soft-danger text-danger";
        icon = "ti-arrow-up";
      } else {
        badgeClass = "badge-soft-success text-success";
        icon = "ti-arrow-up";
      }
    } else {
      badgeClass = "badge-soft-warning text-warning";
      icon = "ti-arrow-down";
    }

    return (
      <span className={`badge ${badgeClass} fs-13`}>
        <i className={`ti ${icon} me-1`}></i>
        {points > 0 ? `+${points}` : points}
      </span>
    );
  };

  // Helper: Render Hạng thành viên
  const renderMembershipTier = (tier: string) => {
    let style: React.CSSProperties = {};
    let icon = "ti-medal";
    let label = "";
    let baseClass = "badge border-0 d-inline-flex align-items-center px-2 py-1 fw-medium fs-12";

    switch (tier) {
      case "Standard":
        baseClass += " badge-soft-secondary text-dark";
        label = "Thành viên";
        break;
      case "Silver":
        style = { backgroundColor: "#A5A9B4", color: "#fff", boxShadow: "0 2px 4px rgba(165, 169, 180, 0.3)" };
        label = "Bạc";
        break;
      case "Gold":
        style = { backgroundColor: "#E6BE37", color: "#fff", boxShadow: "0 2px 4px rgba(230, 190, 55, 0.3)" };
        label = "Vàng";
        break;
      case "Platinum":
        style = { backgroundColor: "#839FB5", color: "#fff", boxShadow: "0 2px 4px rgba(131, 159, 181, 0.3)" };
        label = "Bạch Kim";
        break;
      case "Diamond":
        style = { backgroundColor: "#00AEEF", color: "#fff", boxShadow: "0 2px 4px rgba(0, 174, 239, 0.3)" };
        icon = "ti-diamond";
        label = "Kim Cương";
        break;
      default:
        break;
    }

    return (
      <span className={baseClass} style={Object.keys(style).length > 0 ? style : undefined}>
        <i className={`ti ${icon} me-1`}></i>
        {label}
      </span>
    );
  };

  // 3. Cấu hình cột Table
  const columns: ColumnDef<IPointHistory>[] = [
    {
      key: "customerName",
      title: "Khách hàng",
      render: (row) => (
        <h2 className="d-flex align-items-center">
          <Link to="#" className="avatar avatar-sm rounded-circle border me-2">
            <img src={row.avatar} alt="User" className="w-100 h-100 object-fit-cover rounded-circle" />
          </Link>
          <div className="d-flex flex-column">
            <Link to="#" className="fs-14 fw-medium text-dark text-decoration-none">
              {row.customerName}
            </Link>
            <span className="text-muted fs-12">{row.phone}</span>
          </div>
        </h2>
      ),
    },
    {
      key: "membershipTier",
      title: "Hạng thành viên",
      render: (row) => renderMembershipTier(row.membershipTier),
    },
    {
      key: "accumulatedPoints",
      title: "Điểm lũy kế",
      render: (row) => <span className="fw-medium text-dark">{row.accumulatedPoints.toLocaleString()}</span>,
    },
    {
      key: "currentPoints",
      title: "Điểm hiện tại",
      render: (row) => <span className="fw-bold text-primary fs-14">{row.currentPoints.toLocaleString()}</span>,
    },
    {
      key: "transactionType",
      title: "Nội dung giao dịch",
      render: (row) => <span className="text-dark">{row.transactionType}</span>,
    },
    {
      key: "changedPoints",
      title: "Biến động",
      render: (row) => renderPointChange(row.changedPoints),
    },
    {
      key: "date",
      title: "Thời gian",
      render: (row) => <span className="text-muted">{row.date}</span>,
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
                Lịch sử tích điểm <span className="badge badge-soft-primary ms-2">{mockPointHistory.length}</span>
              </h4>
              <Breadcrumb items={pointHistoryBreadcrumbItems} />
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

          {/* Card Table */}
          <div className="card border-0 rounded-0 shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap bg-white border-bottom">
              {/* Search Bar */}
              <SearchBar placeholder="Tìm kiếm khách hàng..." />

              {/* Filter Row */}
              <div className="d-flex gap-2">
                {/* ---------- Filter Tier (Fixed Dropdown) ---------- */}
                <div className="dropdown position-relative">
                  <button
                    className="btn btn-white border shadow-sm dropdown-toggle d-flex align-items-center"
                    type="button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <i className="ti ti-filter me-1"></i> Hạng thành viên
                  </button>

                  <div
                    className={`dropdown-menu ${showFilterDropdown ? "show" : ""}`}
                    style={
                      showFilterDropdown
                        ? { display: "block", position: "absolute", inset: "0px auto auto 0px", transform: "translate(0px, 40px)", zIndex: 1000 }
                        : {}
                    }
                  >
                    <button className="dropdown-item" type="button" onClick={() => setShowFilterDropdown(false)}>
                      Tất cả
                    </button>
                    <button className="dropdown-item" type="button" onClick={() => setShowFilterDropdown(false)}>
                      Kim Cương
                    </button>
                    <button className="dropdown-item" type="button" onClick={() => setShowFilterDropdown(false)}>
                      Vàng
                    </button>
                    <button className="dropdown-item" type="button" onClick={() => setShowFilterDropdown(false)}>
                      Bạc
                    </button>
                  </div>

                  {showFilterDropdown && (
                    <div
                      className="position-fixed top-0 start-0 w-100 h-100"
                      style={{ zIndex: 999 }}
                      onClick={() => setShowFilterDropdown(false)}
                    ></div>
                  )}
                </div>

                <div className="input-group shadow-sm" style={{ width: "200px" }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="ti ti-calendar-event"></i>
                  </span>
                  <input
                    type={selectedDate ? "date" : "text"}
                    className="form-control border-start-0 ps-0"
                    placeholder="Chọn ngày..."
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = "text";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card-body">
              <Table
                id="point-history-table"
                data={mockPointHistory}
                columns={columns}
                selectable={false}
                selectedRows={selectedRows}
                onSelect={setSelectedRows as any}
              />

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
        </div>
        <Footer />
      </div>
    </div>
  );
}
