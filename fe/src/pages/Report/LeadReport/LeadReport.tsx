/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import Header from "../../../components/Header/Header";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Footer from "../../../components/Footer/Footer";
import Table from "../../../components/Table/Table";
import Pagination from "../../../components/Pagination/Pagination";
import Breadcrumb from "../../../components/Breadcrumb/Breadcrumb";
import type { ColumnDef } from "../../../components/Table/Table.types";
import SearchBar from "../../../components/SearchBar/SearchBar";
import { leadReportBreadcrumbItems } from "../../../utils/breadcrumbs";
import Loading from "../../../components/Loading/Loading";
import { getCookie, useRedirectIfNoToken } from "../../../utils/common";
import type { ICustomerByMonth, IFrequencyItem } from "../../../services/ReportService";
import ReportService from "../../../services/ReportService";

export default function LeadReports() {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [customerByMonthData, setCustomerByMonthData] = useState<number[]>(new Array(12).fill(0));
  const [customerBySourceLabels, setCustomerBySourceLabels] = useState<string[]>([]);
  const [customerBySourceSeries, setCustomerBySourceSeries] = useState<number[]>([]);
  const [tableData, setTableData] = useState<IFrequencyItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItem: 0,
  });
  const [loading, setLoading] = useState(false);

  const token = getCookie("token");
  useRedirectIfNoToken(token);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest(".custom-react-dropdown")) return;
      setOpenDropdownId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      //Chart: Khách hàng theo tháng
      const resMonth = await ReportService.getCustomerByMonth({ year: selectedYear }, token);
      if (resMonth.code === 200) {
        processMonthlyChartData(resMonth.result);
      } else {
        setCustomerByMonthData(new Array(12).fill(0));
      }

      //Chart: Nguồn khách hàng
      const resSource = await ReportService.getCustomerBySource({ year: selectedYear }, token);
      if (resSource.code === 200 && resSource.result) {
        const labels = resSource.result.map((i) => i.sourceName);
        const series = resSource.result.map((i) => i.totalCustomer);
        setCustomerBySourceLabels(labels);
        setCustomerBySourceSeries(series);
      }

      //Table: Tần suất mua bán
      const resFreq = await ReportService.getFrequency(
        {
          year: selectedYear,
          month: selectedMonth,
          page: pagination.page,
          size: pagination.limit,
        },
        token
      );
      if (resFreq.code === 200 && resFreq.result) {
        setTableData(resFreq.result.items);
        setPagination((prev) => ({
          ...prev,
          totalItem: resFreq.result.total,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyChartData = (data: ICustomerByMonth[]) => {
    const filledData = new Array(12).fill(0);
    data.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        filledData[item.month - 1] = item.totalCustomer;
      }
    });
    setCustomerByMonthData(filledData);
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth, pagination.page, pagination.limit]);

  // --- Options Charts ---
  const leadsByYearOptions: ApexOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    },
    yaxis: { title: { text: "Số lượng khách hàng" } },
    fill: { opacity: 1 },
    colors: ["#E41F07"],
    tooltip: { y: { formatter: (val) => val + " Khách hàng" } },
  };

  const leadsBySourceOptions: ApexOptions = {
    chart: { type: "donut", height: 350 },
    labels: customerBySourceLabels,
    colors: ["#E41F07", "#FFA201", "#1ABE17", "#2F80ED", "#6c757d"],
    legend: { position: "bottom" },
    noData: { text: "Không có dữ liệu" },
  };

  const columns: ColumnDef<IFrequencyItem>[] = [
    {
      key: "customerName",
      title: "Tên khách hàng",
      render: (row) => (
        <h2 className="d-flex align-items-center">
          <span className="avatar avatar-sm rounded-circle border me-2 bg-light text-primary d-flex justify-content-center align-items-center fw-bold">
            {row.customerName.charAt(0).toUpperCase()}
          </span>
          <a href="#" className="fs-14 fw-medium text-dark">
            {row.customerName}
          </a>
        </h2>
      ),
    },
    {
      key: "totalInvoice",
      title: "Số hóa đơn",
      render: (row) => <span className="text-center d-block w-50">{row.totalInvoice}</span>,
    },
    {
      key: "totalFee",
      title: "Tổng chi tiêu",
      render: (row) => (
        <span className="fw-medium text-success">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.totalFee)}</span>
      ),
    },
    {
      key: "avgFee",
      title: "Trung bình / Hóa đơn",
      render: (row) => <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.avgFee)}</span>,
    },
  ];

  if (!token) return null;

  type CustomDropdownProps = {
    id: string;
    value: number | string;
    options: { label: string | number; value: number }[];
    onSelect: (val: number) => void;
    iconClass?: string;
  };

  const CustomReactSelect = ({ id, value, options, onSelect, iconClass }: CustomDropdownProps) => {
    const isOpen = openDropdownId === id;
    return (
      <div className="dropdown custom-react-dropdown d-inline-block">
        <button
          className={`btn btn-outline-light shadow btn-sm dropdown-toggle ${isOpen ? "show" : ""}`}
          type="button"
          onClick={() => toggleDropdown(id)}
          aria-expanded={isOpen}
          style={{ minWidth: "80px", justifyContent: "space-between", display: "flex", alignItems: "center" }} // Cố định chiều rộng nút
        >
          <span>
            {iconClass && <i className={`${iconClass} me-1`}></i>}
            {value}
          </span>
        </button>
        <div
          className={`dropdown-menu dropdown-menu-end ${isOpen ? "show" : ""}`}
          style={{
            position: "absolute",
            inset: "0px 0px auto auto",
            margin: "0px",
            transform: "translate(0px, 34px)",
            minWidth: "80px",
            width: "auto",
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`dropdown-item ${value === opt.value || value === opt.label ? "active" : ""}`}
              onClick={() => {
                onSelect(opt.value);
                setOpenDropdownId(null);
              }}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Prepare Options Data
  const yearOptions = [0, 1, 2, 3, 4].map((offset) => ({
    label: currentYear - offset,
    value: currentYear - offset,
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: i + 1,
  }));

  return (
    <div className="main-wrapper">
      {!headerCollapsed && <Header />}
      <Sidebar />

      <div className="page-wrapper">
        <div className="content pb-0">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">Báo cáo khách hàng & Doanh thu</h4>
              <Breadcrumb items={leadReportBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <button className="btn btn-icon btn-outline-light shadow" title="Làm mới" onClick={fetchData}>
                <i className="ti ti-refresh"></i>
              </button>
              <button className="btn btn-icon btn-outline-light shadow" title="Thu gọn" onClick={() => setHeaderCollapsed(!headerCollapsed)}>
                <i className="ti ti-transition-top"></i>
              </button>
            </div>
          </div>

          <div className="row">
            {/* Khách hàng theo năm */}
            <div className="col-md-7 d-flex">
              <div className="card shadow flex-fill border-0">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2 bg-transparent border-bottom-0">
                  <h6 className="mb-0 fw-semibold">Khách hàng theo năm</h6>
                  <CustomReactSelect
                    id="chart1_year"
                    value={selectedYear}
                    options={yearOptions}
                    onSelect={setSelectedYear}
                    iconClass="ti ti-calendar"
                  />
                </div>
                <div className="card-body">
                  <Chart options={leadsByYearOptions} series={[{ name: "Khách hàng", data: customerByMonthData }]} type="bar" height={350} />
                </div>
              </div>
            </div>

            {/* Nguồn khách hàng */}
            <div className="col-md-5 d-flex">
              <div className="card shadow flex-fill border-0">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2 bg-transparent border-bottom-0">
                  <h6 className="mb-0 fw-semibold">Nguồn khách hàng</h6>
                  <CustomReactSelect
                    id="chart2_year"
                    value={selectedYear}
                    options={yearOptions}
                    onSelect={setSelectedYear}
                    iconClass="ti ti-calendar"
                  />
                </div>
                <div className="card-body">
                  <Chart options={leadsBySourceOptions} series={customerBySourceSeries} type="donut" height={350} />
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <h5 className="mb-0">Tần suất mua hàng</h5>
              </div>
              <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#download_report">
                <i className="ti ti-file-download me-1"></i>Tải báo cáo
              </button>
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center">
                    <span className="me-2 fw-medium">Tháng:</span>
                    <CustomReactSelect
                      id="table_month"
                      value={`Tháng ${selectedMonth}`}
                      options={monthOptions}
                      onSelect={(val) => {
                        setSelectedMonth(val);
                        setPagination({ ...pagination, page: 1 });
                      }}
                    />
                  </div>

                  <div className="d-flex align-items-center">
                    <span className="me-2 fw-medium">Năm:</span>
                    <CustomReactSelect
                      id="table_year"
                      value={selectedYear}
                      options={yearOptions}
                      onSelect={(val) => {
                        setSelectedYear(val);
                        setPagination({ ...pagination, page: 1 });
                      }}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <SearchBar placeholder="Tìm kiếm" />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Loading />
                </div>
              ) : (
                <Table id="leads_report_table" data={tableData} columns={columns} selectable={false} />
              )}

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
    </div>
  );
}
