/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import Header from "../../../components/Header/Header";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Footer from "../../../components/Footer/Footer";
import Table from "../../../components/Table/Table";
import Pagination from "../../../components/Pagination/Pagination";
import Breadcrumb from "../../../components/Breadcrumb/Breadcrumb";
import SearchBar from "../../../components/SearchBar/SearchBar";
import type { ColumnDef } from "../../../components/Table/Table.types";
import { productReportBreadcrumbItems } from "../../../utils/breadcrumbs";

// --- 1. CONFIG BIỂU ĐỒ CHO THẨM MỸ VIỆN ---

// 1.1 Biểu đồ Vùng: Doanh thu theo tháng
const revenueByYearSeries = [
  {
    name: "Tổng doanh thu",
    data: [150, 200, 180, 250, 300, 280, 350, 400, 380, 450, 500, 600], // Triệu VNĐ
  },
  {
    name: "Doanh thu Dịch vụ",
    data: [100, 150, 120, 180, 220, 200, 250, 300, 280, 350, 380, 450],
  },
];

const revenueByYearOptions: ApexOptions = {
  chart: {
    type: "area",
    height: 350,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  xaxis: {
    categories: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
  },
  yaxis: {
    title: { text: "Doanh thu (Triệu VNĐ)" },
  },
  colors: ["#E41F07", "#2F80ED"], // Màu chủ đạo & màu phụ
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.6,
      opacityTo: 0.8,
    },
  },
  tooltip: {
    y: {
      formatter: (val) => val + " Triệu",
    },
  },
};

// 1.2 Biểu đồ Tròn: Tỷ trọng Doanh thu (Dịch vụ vs Bán lẻ)
const productCategorySeries = [60, 30, 10]; // 60% Dịch vụ, 30% Mỹ phẩm, 10% Khác
const productCategoryOptions: ApexOptions = {
  chart: {
    type: "donut",
    height: 350,
  },
  labels: ["Dịch vụ công nghệ cao", "Mỹ phẩm bán lẻ", "Phẫu thuật/Tiêm"],
  colors: ["#E41F07", "#1ABE17", "#FFA201"],
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: "Tổng",
            formatter: () => "100%",
          },
        },
      },
    },
  },
  legend: {
    position: "bottom",
  },
};

// --- 2. MOCK DATA: DỊCH VỤ & MỸ PHẨM ---
interface IProductReport extends Record<string, unknown> {
  id: number;
  productName: string;
  productImage: string;
  code: string; // Mã liệu trình/sản phẩm
  type: "Dịch vụ" | "Sản phẩm"; // Phân loại
  category: string;
  price: number;
  usageCount: number; // Số lượt làm hoặc số lượng bán
  revenue: number;
  status: "Đang hoạt động" | "Còn hàng" | "Hết hàng" | "Bảo trì" | "Ngừng kinh doanh";
}

const mockProductReports: IProductReport[] = [
  {
    id: 1,
    productName: "Liệu trình Trẻ hóa da Hifu 360",
    productImage: "https://placehold.co/100x100/ff9999/ffffff?text=HIFU&font=roboto",
    code: "SVC-HIFU-01",
    type: "Dịch vụ",
    category: "Công nghệ cao",
    price: 15000000,
    usageCount: 45, // 45 ca thực hiện
    revenue: 675000000,
    status: "Đang hoạt động",
  },
  {
    id: 2,
    productName: "Serum B5 Phục hồi (30ml)",
    productImage: "https://placehold.co/100x100/add8e6/ffffff?text=Serum+B5&font=roboto",
    code: "PRD-SRM-005",
    type: "Sản phẩm",
    category: "Chăm sóc da",
    price: 850000,
    usageCount: 120, // Bán 120 chai
    revenue: 102000000,
    status: "Còn hàng", // Tương đương Active
  },
  {
    id: 3,
    productName: "Tiêm Filler Juvederm (1cc)",
    productImage: "https://placehold.co/100x100/e6e6fa/ffffff?text=Filler&font=roboto",
    code: "SVC-FIL-02",
    type: "Dịch vụ",
    category: "Thẩm mỹ nội khoa",
    price: 8000000,
    usageCount: 60,
    revenue: 480000000,
    status: "Đang hoạt động",
  },
  {
    id: 4,
    productName: "Kem chống nắng phổ rộng SPF50+",
    productImage: "https://placehold.co/100x100/ffe4b5/ffffff?text=KCN&font=roboto",
    code: "PRD-SPF-010",
    type: "Sản phẩm",
    category: "Chăm sóc da",
    price: 1200000,
    usageCount: 200,
    revenue: 240000000,
    status: "Hết hàng",
  },
  {
    id: 5,
    productName: "Triệt lông Diode Laser (Full Body)",
    productImage: "https://placehold.co/100x100/f08080/ffffff?text=Laser&font=roboto",
    code: "SVC-LSR-09",
    type: "Dịch vụ",
    category: "Laser",
    price: 3500000,
    usageCount: 300,
    revenue: 1050000000,
    status: "Bảo trì", // Máy móc đang bảo trì
  },
];

export default function ProductReport() {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [selectedRows, setSelectedRows] = useState<IProductReport[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItem: mockProductReports.length,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // 3. Cấu hình cột Table
  const columns: ColumnDef<IProductReport>[] = [
    {
      key: "productName",
      title: "Tên Dịch vụ / Sản phẩm",
      render: (row) => (
        <h2 className="d-flex align-items-center">
          <a href="#" className="avatar avatar-md border me-2 bg-light">
            <img src={row.productImage} alt="Product" className="w-100 h-100 object-fit-cover rounded" />
          </a>
          <div className="d-flex flex-column">
            <a href="#" className="fs-14 fw-medium text-dark text-truncate" style={{ maxWidth: "250px" }}>
              {row.productName}
            </a>
            <span className="text-muted fs-12">Mã: {row.code}</span>
          </div>
        </h2>
      ),
    },
    {
      key: "type",
      title: "Loại hình",
      render: (row) => <span className={`badge ${row.type === "Dịch vụ" ? "badge-soft-primary" : "badge-soft-info"}`}>{row.type}</span>,
    },
    {
      key: "price",
      title: "Đơn giá niêm yết",
      render: (row) => <span className="fw-medium text-dark">{formatCurrency(row.price)}</span>,
    },
    {
      key: "usageCount",
      title: "Lượt mua/làm",
      render: (row) => <span className="badge badge-soft-secondary text-dark fs-12">{row.usageCount}</span>,
    },
    {
      key: "revenue",
      title: "Doanh thu",
      render: (row) => <span className="text-success fw-bold">{formatCurrency(row.revenue)}</span>,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (row) => {
        let badgeClass = "bg-secondary";
        if (row.status === "Đang hoạt động" || row.status === "Còn hàng") badgeClass = "bg-success"; // Xanh lá
        if (row.status === "Bảo trì") badgeClass = "bg-warning"; // Vàng
        if (row.status === "Hết hàng" || row.status === "Ngừng kinh doanh") badgeClass = "bg-danger"; // Đỏ

        return <span className={`badge badge-pill badge-status ${badgeClass}`}>{row.status}</span>;
      },
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
                Báo cáo Dịch vụ & Sản phẩm <span className="badge badge-soft-primary ms-2">{mockProductReports.length}</span>
              </h4>
              <Breadcrumb items={productReportBreadcrumbItems} />
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

          {/* --- Charts Section --- */}
          <div className="row">
            <div className="col-md-7 d-flex">
              <div className="card shadow flex-fill border-0">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2 bg-transparent border-bottom-0">
                  <h6 className="mb-0 fw-semibold">Biểu đồ doanh thu (Dịch vụ vs Bán lẻ)</h6>
                  <div className="dropdown">
                    <a className="dropdown-toggle btn btn-outline-light shadow btn-sm" data-bs-toggle="dropdown" href="#">
                      <i className="ti ti-calendar me-1"></i>2025
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="#" className="dropdown-item">
                        2025
                      </a>
                      <a href="#" className="dropdown-item">
                        2024
                      </a>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <Chart options={revenueByYearOptions} series={revenueByYearSeries} type="area" height={350} />
                </div>
              </div>
            </div>
            <div className="col-md-5 d-flex">
              <div className="card shadow flex-fill border-0">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2 bg-transparent border-bottom-0">
                  <h6 className="mb-0 fw-semibold">Tỷ trọng doanh thu theo nhóm</h6>
                  <div className="dropdown">
                    {/* Giữ nguyên dropdown lọc năm */}
                    <a className="dropdown-toggle btn btn-outline-light shadow btn-sm" data-bs-toggle="dropdown" href="#">
                      <i className="ti ti-calendar me-1"></i>2025
                    </a>
                  </div>
                </div>
                <div className="card-body">
                  <Chart options={productCategoryOptions} series={productCategorySeries} type="donut" height={350} />
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm liệu trình, mỹ phẩm..." />
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#download_report">
                <i className="ti ti-file-download me-1"></i>Xuất báo cáo
              </button>
            </div>
            <div className="card-body">
              {/* Filter UI */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <a href="#" className="btn btn-outline-light shadow px-2" data-bs-toggle="dropdown">
                      <i className="ti ti-filter me-2"></i>Bộ lọc<i className="ti ti-chevron-down ms-2"></i>
                    </a>
                    <div className="dropdown-menu p-3" style={{ width: "300px" }}>
                      <div className="mb-3">
                        <label className="form-label fs-13 fw-bold">Loại hình</label>
                        <select className="form-select form-select-sm">
                          <option>Tất cả</option>
                          <option>Dịch vụ (Liệu trình)</option>
                          <option>Sản phẩm (Mỹ phẩm)</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label fs-13 fw-bold">Nhóm</label>
                        <select className="form-select form-select-sm">
                          <option>Tất cả</option>
                          <option>Công nghệ cao</option>
                          <option>Chăm sóc da</option>
                          <option>Tiêm/Phẫu thuật</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div id="reportrange" className="reportrange-picker d-flex align-items-center shadow">
                    <i className="ti ti-calendar-due text-dark fs-14 me-1"></i>
                    <span>Tháng này</span>
                  </div>
                </div>

                {/* Sort */}
                <div className="d-flex align-items-center gap-2">
                  <div className="dropdown">
                    <a href="#" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2"></i>Sắp xếp
                    </a>
                    <div className="dropdown-menu">
                      <a href="#" className="dropdown-item">
                        Doanh thu cao nhất
                      </a>
                      <a href="#" className="dropdown-item">
                        Lượt thực hiện nhiều nhất
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Component */}
              <Table
                id="spa_product_report_table"
                data={mockProductReports}
                columns={columns}
                selectable={true}
                selectedRows={selectedRows}
                onSelect={setSelectedRows}
              />

              {/* Pagination */}
              <div className="mt-3">
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

      {/* Download Modal */}
      <div className="modal fade" id="download_report">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Xuất báo cáo doanh thu</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Chọn định dạng</label>
                <select className="form-select">
                  <option>PDF (Bản in)</option>
                  <option>Excel (Chi tiết)</option>
                </select>
              </div>
              <div className="text-end">
                <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                  Hủy
                </button>
                <button type="button" className="btn btn-primary">
                  Tải về
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
