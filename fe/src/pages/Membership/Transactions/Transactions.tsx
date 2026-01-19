import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Footer from "../../../components/Footer/Footer";
import Table from "../../../components/Table/Table";
import type { ColumnDef } from "../../../components/Table/Table.types";

type Transaction = {
  id: number;
  type: string;
  amount: string;
  date: string;
  paymentType: string;
  status: "Hoàn thành" | "Đã hủy" | "Đang chờ";
};

const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: "Wallet Topup",
    amount: "+$650",
    date: "25 Sep 2023",
    paymentType: "Paypal",
    status: "Hoàn thành",
  },
  {
    id: 2,
    type: "Purchase",
    amount: "-$350",
    date: "26 Sep 2023",
    paymentType: "Cash",
    status: "Hoàn thành",
  },
  {
    id: 3,
    type: "Refund",
    amount: "+$100",
    date: "27 Sep 2023",
    paymentType: "Paypal",
    status: "Đã hủy",
  },
  {
    id: 4,
    type: "Wallet Topup",
    amount: "+$1200",
    date: "29 Sep 2023",
    paymentType: "Credit Card",
    status: "Hoàn thành",
  },
  {
    id: 5,
    type: "Purchase",
    amount: "-$50",
    date: "30 Sep 2023",
    paymentType: "Wallet",
    status: "Đang chờ",
  },
];

export default function Transactions() {
  const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);

  const columns: ColumnDef<Transaction>[] = [
    {
      key: "type",
      title: "Loại giao dịch",
      render: (_, value) => <span className="fw-medium text-dark">{value as string}</span>,
    },
    {
      key: "amount",
      title: "Số tiền",
      render: (_, value) => {
        const valStr = value as string;
        const isPositive = valStr.startsWith("+");
        return <span className={isPositive ? "text-success" : "text-danger"}>{valStr}</span>;
      },
    },
    {
      key: "date",
      title: "Ngày",
    },
    {
      key: "paymentType",
      title: "Phương thức thanh toán",
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_, value) => {
        let badgeClass = "badge-soft-secondary";
        if (value === "Hoàn thành") badgeClass = "badge-soft-success";
        if (value === "Đã hủy") badgeClass = "badge-soft-danger";
        if (value === "Đang chờ") badgeClass = "badge-soft-warning";

        return (
          <span className={`badge ${badgeClass} d-inline-flex align-items-center`}>
            <i className="ti ti-point-filled me-1"></i>
            {value as string}
          </span>
        );
      },
    },
  ];

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content pb-0">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Giao dịch thành viên
                <span className="badge badge-soft-primary ms-2">152</span>
              </h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <Link to="/">Trang chủ</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Giao dịch thành viên
                  </li>
                </ol>
              </nav>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <div className="dropdown">
                <a href="#" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                  <i className="ti ti-package-export me-2"></i>Export
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <ul>
                    <li>
                      <a href="#" className="dropdown-item">
                        <i className="ti ti-file-type-pdf me-1"></i>Export as PDF
                      </a>
                    </li>
                    <li>
                      <a href="#" className="dropdown-item">
                        <i className="ti ti-file-type-xls me-1"></i>Export as Excel
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <a href="#" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="tooltip" title="Refresh">
                <i className="ti ti-refresh"></i>
              </a>
              <a href="#" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="tooltip" title="Collapse" id="collapse-header">
                <i className="ti ti-transition-top"></i>
              </a>
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search"></i>
                </span>
                <input type="text" className="form-control" placeholder="Tìm kiếm" />
              </div>
            </div>
            <div className="card-body">
              {/* Filter Section - (Giữ nguyên code filter của bạn ở đây) */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">{/* ... Code Filter cũ ... */}</div>

              {/* Reusable Table Component */}
              <Table<Transaction>
                id="transactions-table"
                columns={columns}
                data={mockTransactions}
                selectable={true}
                selectedRows={selectedRows}
                onSelect={setSelectedRows} // Rút gọn hàm callback
              />

              {/* Pagination Mock */}
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
    </div>
  );
}
