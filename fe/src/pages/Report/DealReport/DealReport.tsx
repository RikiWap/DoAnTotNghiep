// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from "react";
// import Chart from "react-apexcharts";
// import type { ApexOptions } from "apexcharts";
// import Header from "../../../components/Header/Header";
// import Sidebar from "../../../components/Sidebar/Sidebar";
// import Footer from "../../../components/Footer/Footer";
// import Table from "../../../components/Table/Table";
// import Pagination from "../../../components/Pagination/Pagination";
// import Breadcrumb from "../../../components/Breadcrumb/Breadcrumb";
// import SearchBar from "../../../components/SearchBar/SearchBar";
// import type { ColumnDef } from "../../../components/Table/Table.types";

// // --- 1. Mock Data & Config cho Biểu đồ (Charts) ---

// // 1.1 Biểu đồ cột: Deals By Year
// const dealsByYearSeries = [
//   {
//     name: "Deals",
//     data: [20, 40, 60, 80, 100, 40, 80, 20, 60, 80, 30, 60],
//   },
// ];

// const dealsByYearOptions: ApexOptions = {
//   chart: {
//     type: "bar",
//     height: 350,
//     toolbar: { show: false },
//   },
//   plotOptions: {
//     bar: {
//       horizontal: false,
//       columnWidth: "55%",
//       borderRadius: 4,
//     },
//   },
//   dataLabels: { enabled: false },
//   stroke: { show: true, width: 2, colors: ["transparent"] },
//   xaxis: {
//     categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
//   },
//   yaxis: {
//     title: { text: "Deals Count" },
//   },
//   fill: { opacity: 1 },
//   colors: ["#E41F07"], // Màu primary của template
//   tooltip: {
//     y: {
//       formatter: (val) => val + " Deals",
//     },
//   },
// };

// // 1.2 Biểu đồ tròn: Leads By Source
// const leadsBySourceSeries = [44, 55, 41, 17];
// const leadsBySourceOptions: ApexOptions = {
//   chart: {
//     type: "donut",
//     height: 350,
//   },
//   labels: ["Google", "Social Media", "Email", "Referrals"],
//   colors: ["#E41F07", "#FFA201", "#1ABE17", "#2F80ED"],
//   plotOptions: {
//     pie: {
//       donut: {
//         size: "65%",
//       },
//     },
//   },
//   legend: {
//     position: "bottom",
//   },
// };

// // --- 2. Mock Data cho Bảng (Table) ---
// interface IDealReport {
//   id: number;
//   dealName: string;
//   stage: string;
//   dealValue: string;
//   tags: string[];
//   expectedCloseDate: string;
//   probability: string;
//   status: "Won" | "Lost" | "Open";
// }

// const mockDealReports: IDealReport[] = [
//   {
//     id: 1,
//     dealName: "Annual Software Subscription",
//     stage: "Sales",
//     dealValue: "$5,500",
//     tags: ["Rated", "Collab"],
//     expectedCloseDate: "15 May 2025",
//     probability: "80%",
//     status: "Won",
//   },
//   {
//     id: 2,
//     dealName: "CRM Onboarding Package",
//     stage: "Marketing",
//     dealValue: "$4,200",
//     tags: ["Promotion"],
//     expectedCloseDate: "20 Jun 2025",
//     probability: "45%",
//     status: "Lost",
//   },
//   {
//     id: 3,
//     dealName: "Enterprise Plan Upgrade",
//     stage: "Calls",
//     dealValue: "$12,000",
//     tags: ["Rejected"],
//     expectedCloseDate: "10 Jul 2025",
//     probability: "60%",
//     status: "Open",
//   },
//   {
//     id: 4,
//     dealName: "Consulting Services",
//     stage: "Sales",
//     dealValue: "$3,000",
//     tags: ["Rated"],
//     expectedCloseDate: "05 Aug 2025",
//     probability: "90%",
//     status: "Won",
//   },
// ];

// export default function DealReport() {
//   const [headerCollapsed, setHeaderCollapsed] = useState(false);
//   const [selectedRows, setSelectedRows] = useState<IDealReport[]>([]);

//   // Pagination State
//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     totalItem: mockDealReports.length,
//   });

//   // 3. Cấu hình cột Table
//   const columns: ColumnDef<IDealReport>[] = [
//     {
//       key: "dealName",
//       title: "Deal Name",
//       render: (row) => <span className="fw-medium text-dark">{row.dealName}</span>,
//     },
//     {
//       key: "stage",
//       title: "Stage",
//     },
//     {
//       key: "dealValue",
//       title: "Deal Value",
//     },
//     {
//       key: "tags",
//       title: "Tags",
//       render: (row) => (
//         <div className="d-flex align-items-center">
//           {row.tags.map((tag, idx) => (
//             <span key={idx} className={`badge badge-tag ${tag === "Rejected" ? "badge-soft-danger" : "badge-soft-success"} me-1`}>
//               {tag}
//             </span>
//           ))}
//         </div>
//       ),
//     },
//     {
//       key: "expectedCloseDate",
//       title: "Expected Close Date",
//     },
//     {
//       key: "probability",
//       title: "Probability",
//     },
//     {
//       key: "status",
//       title: "Status",
//       render: (row) => {
//         let badgeClass = "badge-soft-secondary";
//         if (row.status === "Won") badgeClass = "badge-soft-success";
//         if (row.status === "Lost") badgeClass = "badge-soft-danger";
//         if (row.status === "Open") badgeClass = "badge-soft-info";

//         return <span className={`badge badge-pill badge-status ${badgeClass}`}>{row.status}</span>;
//       },
//     },
//   ];

//   return (
//     <div className="main-wrapper">
//       <Header />
//       <Sidebar />

//       <div className="page-wrapper">
//         <div className="content pb-0">
//           {/* Page Header */}
//           <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
//             <div>
//               <h4 className="mb-1">
//                 Deal Report <span className="badge badge-soft-primary ms-2">125</span>
//               </h4>
//               <Breadcrumb
//                 items={[
//                   { title: "Home", link: "/" },
//                   { title: "Deal Report", link: "/deal-reports" },
//                 ]}
//               />
//             </div>
//             <div className="gap-2 d-flex align-items-center flex-wrap">
//               <button className="btn btn-icon btn-outline-light shadow" title="Refresh">
//                 <i className="ti ti-refresh"></i>
//               </button>
//               <button className="btn btn-icon btn-outline-light shadow" title="Collapse" onClick={() => setHeaderCollapsed(!headerCollapsed)}>
//                 <i className="ti ti-transition-top"></i>
//               </button>
//             </div>
//           </div>
//           {/* End Page Header */}

//           {/* --- Charts Section --- */}
//           <div className="row">
//             <div className="col-md-7 d-flex">
//               <div className="card shadow flex-fill border-0">
//                 <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2 bg-transparent border-bottom-0">
//                   <h6 className="mb-0 fw-semibold">Deals By Year</h6>
//                   <div className="dropdown">
//                     <a className="dropdown-toggle btn btn-outline-light shadow btn-sm" data-bs-toggle="dropdown" href="#">
//                       <i className="ti ti-calendar me-1"></i>2025
//                     </a>
//                     <div className="dropdown-menu dropdown-menu-end">
//                       <a href="#" className="dropdown-item">
//                         2025
//                       </a>
//                       <a href="#" className="dropdown-item">
//                         2024
//                       </a>
//                       <a href="#" className="dropdown-item">
//                         2023
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="card-body">
//                   <Chart options={dealsByYearOptions} series={dealsByYearSeries} type="bar" height={350} />
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-5 d-flex">
//               <div className="card shadow flex-fill border-0">
//                 <div className="card-header d-flex justify-content-between align-items-center flex-wrap row-gap-2 bg-transparent border-bottom-0">
//                   <h6 className="mb-0 fw-semibold">Leads By Source</h6>
//                   <div className="dropdown">
//                     <a className="dropdown-toggle btn btn-outline-light shadow btn-sm" data-bs-toggle="dropdown" href="#">
//                       <i className="ti ti-calendar me-1"></i>2025
//                     </a>
//                     <div className="dropdown-menu dropdown-menu-end">
//                       <a href="#" className="dropdown-item">
//                         2025
//                       </a>
//                       <a href="#" className="dropdown-item">
//                         2024
//                       </a>
//                       <a href="#" className="dropdown-item">
//                         2023
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="card-body">
//                   <Chart options={leadsBySourceOptions} series={leadsBySourceSeries} type="donut" height={350} />
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* --- End Charts Section --- */}

//           {/* Table Section */}
//           <div className="card border-0 rounded-0">
//             <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
//               <SearchBar placeholder="Search" />
//               <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#download_report">
//                 <i className="ti ti-file-download me-1"></i>Download Report
//               </button>
//             </div>
//             <div className="card-body">
//               {/* Filter UI (Mock) */}
//               <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
//                 <div className="d-flex align-items-center gap-2 flex-wrap">
//                   <div className="dropdown">
//                     <a href="#" className="btn btn-outline-light shadow px-2" data-bs-toggle="dropdown">
//                       <i className="ti ti-filter me-2"></i>Filter<i className="ti ti-chevron-down ms-2"></i>
//                     </a>
//                     <div className="dropdown-menu p-3" style={{ width: "300px" }}>
//                       <h6>Filter Options (Mock)</h6>
//                     </div>
//                   </div>
//                   <div id="reportrange" className="reportrange-picker d-flex align-items-center shadow">
//                     <i className="ti ti-calendar-due text-dark fs-14 me-1"></i>
//                     <span>9 Jun 25 - 9 Jun 25</span>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center gap-2">
//                   <div className="dropdown">
//                     <a href="#" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
//                       <i className="ti ti-sort-ascending-2 me-2"></i>Sort By
//                     </a>
//                     <div className="dropdown-menu">
//                       <a href="#" className="dropdown-item">
//                         Newest
//                       </a>
//                       <a href="#" className="dropdown-item">
//                         Oldest
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Table Component */}
//               <Table
//                 id="deal_report_table"
//                 data={mockDealReports}
//                 columns={columns}
//                 selectable={true}
//                 selectedRows={selectedRows}
//                 onSelect={setSelectedRows as any}
//               />

//               {/* Pagination */}
//               <div className="mt-3">
//                 <Pagination
//                   total={pagination.totalItem}
//                   page={pagination.page}
//                   perPage={pagination.limit}
//                   onPageChange={(p) => setPagination({ ...pagination, page: p })}
//                   onPerPageChange={(l) => setPagination({ ...pagination, limit: l, page: 1 })}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </div>

//       {/* Download Modal Mock */}
//       <div className="modal fade" id="download_report">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">Download Report</h5>
//               <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
//             </div>
//             <div className="modal-body">
//               <div className="mb-3">
//                 <label className="form-label">File Type</label>
//                 <select className="form-select">
//                   <option>PDF</option>
//                   <option>Excel</option>
//                 </select>
//               </div>
//               <div className="text-end">
//                 <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
//                   Cancel
//                 </button>
//                 <button type="button" className="btn btn-primary">
//                   Download
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
