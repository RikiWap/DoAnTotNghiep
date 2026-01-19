/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import ExportButton from "../../components/ExportButton/ExportButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";

// 1. Định nghĩa Type
interface ITask {
  id: number;
  title: string;
  type: "Calls" | "Email" | "Task" | "Meeting";
  status: "Pending" | "Inprogress" | "Completed" | "Rejected";
  priority?: "High" | "Medium" | "Low";
  dueDate: string;
  tags: string[];
  completed: boolean;
  assigneeAvatar: string;
}

interface ITaskGroup {
  title: string;
  count?: number;
  tasks: ITask[];
}

// 2. Mock Data
const mockTaskGroups: ITaskGroup[] = [
  {
    title: "Gần đây",
    count: 24,
    tasks: [
      {
        id: 1,
        title: "Add a form to Update Task",
        type: "Calls",
        status: "Pending",
        dueDate: "25 Apr 2025",
        tags: ["Promotion"],
        completed: false,
        assigneeAvatar: "assets/img/profiles/avatar-14.jpg",
      },
      {
        id: 2,
        title: "Make all strokes thinner",
        type: "Email",
        status: "Pending",
        dueDate: "25 Apr 2025",
        tags: ["Rejected", "Collab"],
        completed: false,
        assigneeAvatar: "assets/img/profiles/avatar-15.jpg",
      },
      {
        id: 3,
        title: "Update original content",
        type: "Calls",
        status: "Inprogress",
        dueDate: "25 Apr 2025",
        tags: ["Promotion"],
        completed: false,
        assigneeAvatar: "assets/img/profiles/avatar-16.jpg",
      },
      {
        id: 4,
        title: "Use only component colours",
        type: "Task",
        status: "Inprogress",
        dueDate: "25 Apr 2025",
        tags: ["Collab", "Rated"],
        completed: false,
        assigneeAvatar: "assets/img/profiles/avatar-17.jpg",
      },
    ],
  },
  {
    title: "Hôm qua",
    tasks: [
      {
        id: 5,
        title: "Add images to the cards section",
        type: "Calls",
        status: "Inprogress",
        dueDate: "24 Apr 2025",
        tags: ["Promotion"],
        completed: false,
        assigneeAvatar: "assets/img/profiles/avatar-18.jpg",
      },
      {
        id: 6,
        title: "Add images to the cards section",
        type: "Calls",
        status: "Rejected",
        dueDate: "25 Apr 2025",
        tags: ["Promotion"],
        completed: false,
        assigneeAvatar: "assets/img/profiles/avatar-19.jpg",
      },
    ],
  },
  {
    title: "23 Apr 2025",
    tasks: [
      {
        id: 7,
        title: "Design description banner & landing page",
        type: "Task",
        status: "Inprogress",
        dueDate: "23 Apr 2025",
        tags: ["Collab", "Rated"],
        completed: false,
        assigneeAvatar: "assets/img/profiles/avatar-20.jpg",
      },
      {
        id: 8,
        title: "Make all strokes thinner",
        type: "Email",
        status: "Completed",
        dueDate: "23 Apr 2025",
        tags: ["Promotion"],
        completed: true,
        assigneeAvatar: "assets/img/profiles/avatar-21.jpg",
      },
    ],
  },
];

export default function Task() {
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  // Helper để lấy màu border dựa trên trạng thái
  const getBorderColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "border-info";
      case "Inprogress":
        return "border-warning";
      case "Completed":
        return "border-success";
      case "Rejected":
        return "border-danger";
      default:
        return "border-primary";
    }
  };

  // Helper lấy badge class cho loại task
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "Calls":
        return "badge-soft-success";
      case "Email":
        return "badge-soft-warning";
      case "Task":
        return "badge-soft-info";
      case "Meeting":
        return "badge-soft-purple"; // Giả sử có class này hoặc thay bằng primary
      default:
        return "badge-soft-secondary";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "badge-soft-info";
      case "Inprogress":
        return "badge-soft-warning";
      case "Completed":
        return "badge-soft-success";
      case "Rejected":
        return "badge-soft-danger";
      default:
        return "badge-soft-secondary";
    }
  };

  return (
    <div className="main-wrapper">
      {!headerCollapsed && <Header />}
      <Sidebar />

      <div className="page-wrapper">
        <div className="content pb-0">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Công việc <span className="badge badge-soft-primary ms-2">123</span>
              </h4>
              <Breadcrumb items={[{ label: "Công việc", active: true }]} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => {}} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>
          {/* End Page Header */}

          {/* Card Start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Search" />
              <AddButton
                label="Add New Task"
                onClick={() => {
                  const offcanvas = document.getElementById("offcanvas_add");
                  if (offcanvas) offcanvas.classList.add("show");
                }}
              />
            </div>
            <div className="card-body">
              {/* Filter / Toolbar Section */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="dropdown">
                    <a className="dropdown-toggle btn btn-outline-light shadow" data-bs-toggle="dropdown" href="#">
                      All Tasks
                    </a>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a href="#" className="dropdown-item active">
                        All Tasks
                      </a>
                      <a href="#" className="dropdown-item">
                        Important
                      </a>
                      <a href="#" className="dropdown-item">
                        Completed
                      </a>
                    </div>
                  </div>

                  {/* Filter Dropdown */}
                  <div className="dropdown">
                    <a href="#" className="btn btn-outline-light shadow px-2" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                      <i className="ti ti-filter me-2"></i>Filter
                      <i className="ti ti-chevron-down ms-2"></i>
                    </a>
                    <div className="filter-dropdown-menu dropdown-menu dropdown-menu-xl p-0">
                      <div className="filter-header d-flex align-items-center justify-content-between border-bottom">
                        <h6 className="mb-0">
                          <i className="ti ti-filter me-1"></i>Filter
                        </h6>
                        <button type="button" className="btn-close close-filter-btn" data-bs-dismiss="dropdown" aria-label="Close"></button>
                      </div>
                      <div className="filter-set-view p-3">
                        {/* Simplified Filter Content */}
                        <div className="accordion" id="accordionExample">
                          <div className="filter-set-content">
                            <div className="filter-set-content-head">
                              <a href="#" className="collapsed" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false">
                                Task Name
                              </a>
                            </div>
                            <div className="filter-set-contents accordion-collapse collapse" id="collapseThree" data-bs-parent="#accordionExample">
                              <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                <ul>
                                  <li>
                                    <label className="dropdown-item px-2 d-flex align-items-center">
                                      <input className="form-check-input m-0 me-1" type="checkbox" />
                                      Add a form to Update Task
                                    </label>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-3">
                          <a href="#" className="btn btn-outline-light w-100">
                            Reset
                          </a>
                          <a href="#" className="btn btn-primary w-100">
                            Filter
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Range Picker Mock */}
                  <div id="reportrange" className="reportrange-picker d-flex align-items-center shadow">
                    <i className="ti ti-calendar-due text-dark fs-14 me-1"></i>
                    <span className="reportrange-picker-field">9 Jun 25 - 9 Jun 25</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="form-check form-check-md">
                    <input className="form-check-input" type="checkbox" id="select-all" />
                    <label className="form-check-label" htmlFor="select-all">
                      Mark all as read
                    </label>
                  </div>
                  <div className="dropdown">
                    <a href="#" className="dropdown-toggle btn btn-outline-light px-2 shadow" data-bs-toggle="dropdown">
                      <i className="ti ti-sort-ascending-2 me-2"></i>Sort By
                    </a>
                    <div className="dropdown-menu">
                      <ul>
                        <li>
                          <a href="#" className="dropdown-item">
                            Newest
                          </a>
                        </li>
                        <li>
                          <a href="#" className="dropdown-item">
                            Oldest
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task List Rendering */}
              {mockTaskGroups.map((group, groupIndex) => (
                <div className="task-wrap border-bottom mb-3" key={groupIndex}>
                  <a
                    href="#"
                    className="d-flex align-items-center justify-content-between mb-3"
                    data-bs-toggle="collapse"
                    data-bs-target={`#task_group_${groupIndex}`}
                  >
                    <h6 className="fs-16 mb-0">
                      {group.title}
                      {group.count && <span className="badge badge-avatar text-dark bg-soft-dark rounded-circle ms-2 fw-medium">{group.count}</span>}
                    </h6>
                    <i className="ti ti-chevron-up arrow-rotate"></i>
                  </a>
                  <div className="collapse show" id={`task_group_${groupIndex}`}>
                    {group.tasks.map((task) => (
                      <div className="card rounded-start-0 mb-3" key={task.id}>
                        <div className={`card-body border-start border-3 ${getBorderColor(task.status)}`}>
                          <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3">
                            <div className="d-flex align-items-center flex-wrap row-gap-2">
                              <span className="me-3">
                                <i className="ti ti-grip-vertical"></i>
                              </span>
                              <div className="form-check form-check-md me-3">
                                <input className="form-check-input" type="checkbox" defaultChecked={task.completed} />
                              </div>
                              <div className="set-star rating-select me-3">
                                <i className="ti ti-star-filled fs-16"></i>
                              </div>
                              <h6 className={`fw-semibold mb-0 fs-14 me-3 ${task.completed ? "text-decoration-line-through" : ""}`}>{task.title}</h6>
                              <span className={`badge ${getTypeBadgeClass(task.type)} border-0 me-2`}>
                                {task.type === "Calls" && <i className="ti ti-phone me-1"></i>}
                                {task.type === "Email" && <i className="ti ti-mail me-1"></i>}
                                {task.type === "Task" && <i className="ti ti-subtask me-1"></i>}
                                {task.type === "Meeting" && <i className="ti ti-user-share me-1"></i>}
                                {task.type}
                              </span>
                              <span className={`badge ${getStatusBadgeClass(task.status)}`}>{task.status}</span>
                            </div>
                            <div className="d-flex align-items-center flex-wrap row-gap-2">
                              {task.tags.map((tag, i) => (
                                <div className="me-2" key={i}>
                                  <span
                                    className={`badge ${tag === "Rejected" ? "badge-soft-danger" : tag === "Collab" ? "badge-soft-success" : tag === "Rated" ? "badge-soft-warning" : "badge-soft-primary"}`}
                                  >
                                    {tag}
                                  </span>
                                </div>
                              ))}
                              <div className="me-2">
                                <i className="ti ti-calendar-exclamation me-1"></i>
                                {task.dueDate}
                              </div>
                              <div className="avatar avatar-xs avatar-rounded me-2">
                                {/* Thay ảnh thật bằng placeholder nếu cần */}
                                <img src={task.assigneeAvatar} alt="img" />
                              </div>
                              <div className="dropdown table-action">
                                <a
                                  href="#"
                                  className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <i className="ti ti-dots-vertical"></i>
                                </a>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const offcanvas = document.getElementById("offcanvas_edit");
                                      if (offcanvas) offcanvas.classList.add("show");
                                    }}
                                  >
                                    <i className="ti ti-edit text-blue"></i> Edit
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_task"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const modal = document.getElementById("delete_task");
                                      if (modal) modal.classList.add("show");
                                      // Note: Bootstrap modal needs JS style manipulation or data-bs attributes
                                      // if not using bootstrap js bundle directly.
                                    }}
                                  >
                                    <i className="ti ti-trash"></i> Delete
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* End Card */}
        </div>

        <Footer />
      </div>

      {/* --- Modals & Offcanvas Section --- */}

      {/* Add Task Offcanvas */}
      <div className="offcanvas offcanvas-end offcanvas-large" tabIndex={-1} id="offcanvas_add">
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Task</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            onClick={() => document.getElementById("offcanvas_add")?.classList.remove("show")}
          >
            <i className="ti ti-x"></i>
          </button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Title<span className="text-danger">*</span>
                  </label>
                  <input type="text" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select className="form-select">
                    <option>Choose</option>
                    <option>Calls</option>
                    <option>Email</option>
                    <option>Meeting</option>
                  </select>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Responsible Persons <span className="text-danger">*</span>
                  </label>
                  <select className="form-select" multiple>
                    <option>Darlee Robertson</option>
                    <option>Sharon Roy</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Start Date<span className="text-danger"> *</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                    <input type="date" className="form-control" />
                    <span className="input-group-text">
                      <i className="ti ti-calendar"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Due Date <span className="text-danger">*</span>
                  </label>
                  <div className="input-group w-auto input-group-flat">
                    <input type="date" className="form-control" />
                    <span className="input-group-text">
                      <i className="ti ti-calendar"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea className="form-control" rows={3}></textarea>
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button type="button" className="btn btn-light me-2" onClick={() => document.getElementById("offcanvas_add")?.classList.remove("show")}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Task Offcanvas */}
      <div className="offcanvas offcanvas-end offcanvas-large" tabIndex={-1} id="offcanvas_edit">
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Edit Task</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            onClick={() => document.getElementById("offcanvas_edit")?.classList.remove("show")}
          >
            <i className="ti ti-x"></i>
          </button>
        </div>
        <div className="offcanvas-body">
          {/* Simplified Edit Form */}
          <p>Edit Task Content...</p>
          <div className="d-flex align-items-center justify-content-end mt-3">
            <button type="button" className="btn btn-light me-2" onClick={() => document.getElementById("offcanvas_edit")?.classList.remove("show")}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete_task" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24"></i>
                </span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">Are you sure you want to remove tasks you selected.</p>
              <div className="d-flex justify-content-center">
                <button type="button" className="btn btn-light position-relative z-1 me-2 w-100" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="button" className="btn btn-primary position-relative z-1 w-100">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
