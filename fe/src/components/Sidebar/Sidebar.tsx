/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import SimpleBar from "simplebar-react";
import SubMenuMotion from "../SubMenuMotion/SubMenuMotion";
import { NavLink, useLocation } from "react-router-dom";
import "simplebar-react/dist/simplebar.min.css";

import logo from "../../assets/img/logo.svg";
import logoSmall from "../../assets/img/logo-small.svg";
import logoWhite from "../../assets/img/logo-white.svg";

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<string>("");
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
    dashboard: true,
    settings_general: false,
    system_settings: false,
  });

  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Add mapping: tabKey -> submenuKey (nếu là con của submenu)
  const submenuParent: Record<string, string | undefined> = {
    "profile-settings": "settings_general",
    "security-settings": "settings_general",
    "notifications-settings": "settings_general",
    "customer-settings": "system_settings",
    "membership-plans": "membership",
    "membership-addons": "membership",
    "membership-transactions": "membership",
    "lead-reports": "report",
    "deal-reports": "report",
    "product-reports": "report",
    "company-reports": "report",
    "project-reports": "report",
    "task-reports": "report",
    calendar: "application",
    "call-history": "application",
    "point-history": "application",
  };

  const pathToTabKey: Record<string, string> = {
    "/branch": "branch",
    "/resources": "resources",
    "/manager-users": "manager-users",
    "/roles-permissions": "roles-permissions",
    "/profile-settings": "profile-settings",
    "/customers": "customers",
    "/customers-grid": "customers",
    "/customer-settings": "customer-settings",
    "/membership-plans": "membership-plans",
    "/membership-addons": "membership-addons",
    "/membership-transactions": "membership-transactions",
    "/payment": "payment",
    "/invoice": "invoice",
    "/voucher": "voucher",
    "/unit": "unit",
    "/task": "task",
    "/category": "category",
    "/product": "product",
    "/service": "service",
    "/customer-source": "customerSource",
    "/pipeline": "pipeline",
    "/project": "project",
    "/proposal": "proposal",
    "/lost-reason": "lost-reason",
    "/industry": "industry",
    "/contact-stage": "contact-stage",
    "/calendar": "calendar",
    "/call-history": "call-history",
    "/point-history": "point-history",
  };

  const location = useLocation();

  useEffect(() => {
    // Cập nhật activeTab khi thay đổi route
    const currentTab = pathToTabKey[location.pathname];
    if (currentTab) {
      setActiveTab(currentTab);
      const parent = submenuParent[currentTab];
      if (parent) {
        setOpenSubmenus((prev) => ({
          ...prev,
          [parent]: true,
        }));
      }
    }
  }, [location.pathname]);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);

    const parent = submenuParent[tabKey];
    if (parent) {
      setOpenSubmenus((prev) => ({
        ...prev,
        [parent]: true,
      }));
    }
  };

  useEffect(() => {
    const handleHover = () => {
      if (document.body.classList.contains("mini-sidebar")) {
        document.body.classList.add("expand-menu");
      }
    };

    const handleMouseLeave = () => {
      document.body.classList.remove("expand-menu");
    };

    const sidebar = document.querySelector(".sidebar");
    sidebar?.addEventListener("mouseenter", handleHover);
    sidebar?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      sidebar?.removeEventListener("mouseenter", handleHover);
      sidebar?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleToggle = () => {
    document.body.classList.toggle("mini-sidebar");
  };

  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div>
          <a href="/" className="logo logo-normal">
            <img src={logo} alt="Logo" />
          </a>
          <a href="/" className="logo-small">
            <img src={logoSmall} alt="Logo" />
          </a>
          <a href="/" className="dark-logo">
            <img src={logoWhite} alt="Logo" />
          </a>
        </div>
        <button className="sidenav-toggle-btn btn border-0 p-0 active" id="toggle_btn" onClick={handleToggle}>
          <i className="ti ti-arrow-bar-to-left"></i>
        </button>
        <button className="sidebar-close">
          <i className="ti ti-x align-middle"></i>
        </button>
      </div>

      <SimpleBar className="sidebar-inner">
        <div id="sidebar-menu" className="sidebar-menu">
          <ul>
            <li className="menu-title">
              <span>Menu chính</span>
            </li>
            <li>
              <ul>
                {/* Dashboard Submenu */}
                {/* <li className="submenu">
                  <a
                    href="#"
                    className={openSubmenus.dashboard ? "active subdrop" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuToggle("dashboard");
                    }}
                  >
                    <i className="ti ti-dashboard"></i>
                    <span>Dashboard</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <SubMenuMotion open={openSubmenus.dashboard}>
                    <li>
                      <a href="/" className="active">
                        Deals Dashboard
                      </a>
                    </li>
                    <li>
                      <a href="leads-dashboard.html">Leads Dashboard</a>
                    </li>
                    <li>
                      <a href="project-dashboard.html">Project Dashboard</a>
                    </li>
                  </SubMenuMotion>
                </li> */}
                {/* Applications Submenu */}
                <li className="submenu">
                  <a
                    href="#"
                    className={openSubmenus.application ? "active subdrop" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuToggle("application");
                    }}
                  >
                    <i className="ti ti-brand-airtable"></i>
                    <span>Ứng dụng</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <SubMenuMotion open={openSubmenus.application}>
                    <li>
                      <NavLink
                        to="/call-history"
                        className={activeTab === "call-history" ? "active call-history-tab" : "call-history-tab"}
                        onClick={() => handleTabClick("call-history")}
                      >
                        Lịch sử cuộc gọi
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/calendar"
                        className={activeTab === "calendar" ? "active calendar-tab" : "calendar-tab"}
                        onClick={() => handleTabClick("calendar")}
                      >
                        Lịch hẹn
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/point-history"
                        className={activeTab === "point-history" ? "active point-history-tab" : "point-history-tab"}
                        onClick={() => handleTabClick("point-history")}
                      >
                        Lịch sử tích điểm
                      </NavLink>
                    </li>
                  </SubMenuMotion>
                  {/* <ul>
                    <li>
                      <a href="chat.html">Chat</a>
                    </li>
                    <li className="submenu submenu-two">
                      <a href="javascript:void(0);">
                        Call<span className="menu-arrow inside-submenu"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="video-call.html">Video Call</a>
                        </li>
                        <li>
                          <a href="audio-call.html">Audio Call</a>
                        </li>
                        <li>
                          <a href="call-history.html">Call History</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="calendar.html">Calendar</a>
                    </li>
                    <li>
                      <a href="email.html">Email</a>
                    </li>
                    <li>
                      <a href="todo.html">To Do</a>
                    </li>
                    <li>
                      <a href="notes.html">Notes</a>
                    </li>
                    <li>
                      <a href="file-manager.html">File Manager</a>
                    </li>
                    <li>
                      <a href="social-feed.html">Social Feed</a>
                    </li>
                    <li>
                      <a href="kanban-view.html">Kanban</a>
                    </li>
                    <li>
                      <a href="invoice.html">Invoices</a>
                    </li>
                  </ul> */}
                </li>

                {/* Super Admin Submenu */}
                {/* <li className="submenu">
                  <a href="#">
                    <i className="ti ti-user-star"></i>
                    <span>Super Admin</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="dashboard.html">Dashboard</a>
                    </li>
                    <li>
                      <a href="company.html">Companies</a>
                    </li>
                    <li>
                      <a href="subscription.html">Subscriptions</a>
                    </li>
                    <li>
                      <a href="packages.html">Packages</a>
                    </li>
                    <li>
                      <a href="domain.html">Domain</a>
                    </li>
                    <li>
                      <a href="purchase-transaction.html">Purchase Transaction</a>
                    </li>
                  </ul>
                </li> */}
                {/* Layouts Submenu */}
                {/* <li className="submenu">
                  <a href="#">
                    <i className="ti ti-layout-grid"></i>
                    <span>Layouts</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="layout-mini.html">Mini</a>
                    </li>
                    <li>
                      <a href="layout-hoverview.html">Hover View</a>
                    </li>
                    <li>
                      <a href="layout-hidden.html">Hidden</a>
                    </li>
                    <li>
                      <a href="layout-fullwidth.html">Full Width</a>
                    </li>
                    <li>
                      <a href="layout-rtl.html">RTL</a>
                    </li>
                    <li>
                      <a href="layout-dark.html">Dark</a>
                    </li>
                  </ul>
                </li> */}
              </ul>
            </li>
            {/* CRM Section */}
            <li className="menu-title">
              <span>CRM</span>
            </li>
            <li>
              <ul>
                <li>
                  <NavLink to="/customers" className={activeTab === "customers" ? "active" : ""} onClick={() => handleTabClick("customers")}>
                    <i className="ti ti-user-up"></i>
                    <span>Khách hàng</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/customer-source"
                    className={activeTab === "customerSource" ? "active" : ""}
                    onClick={() => handleTabClick("customerSource")}
                  >
                    <i className="ti ti-chart-arcs"></i>
                    <span>Nguồn khách hàng</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/branch" className={activeTab === "branch" ? "active" : ""} onClick={() => handleTabClick("branch")}>
                    <i className="ti ti-building-community"></i>
                    <span>Chi nhánh</span>
                  </NavLink>
                </li>
                {/* <li>
                  <NavLink to="/payment" className={activeTab === "payment" ? "active" : ""} onClick={() => handleTabClick("payment")}>
                    <i className="ti ti-report-money"></i>
                    <span>Thanh toán</span>
                  </NavLink>
                </li> */}
                <li>
                  <NavLink to="/invoice" className={activeTab === "invoice" ? "active" : ""} onClick={() => handleTabClick("invoice")}>
                    <i className="ti ti-file-invoice"></i>
                    <span>Hóa đơn</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/voucher" className={activeTab === "voucher" ? "active" : ""} onClick={() => handleTabClick("voucher")}>
                    <i className="ti ti-medal"></i>
                    <span>Voucher</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/unit" className={activeTab === "unit" ? "active" : ""} onClick={() => handleTabClick("unit")}>
                    <i className="ti ti-bounce-right"></i>
                    <span>Đơn vị</span>
                  </NavLink>
                </li>
                {/* <li>
                  <NavLink to="/task" className={activeTab === "task" ? "active" : ""} onClick={() => handleTabClick("task")}>
                    <i className="ti ti-list-check"></i>
                    <span>Công việc</span>
                  </NavLink>
                </li> */}
                <li>
                  <NavLink to="/category" className={activeTab === "category" ? "active" : ""} onClick={() => handleTabClick("category")}>
                    <i className="ti ti-brand-campaignmonitor"></i>
                    <span>Danh mục</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/product" className={activeTab === "product" ? "active" : ""} onClick={() => handleTabClick("product")}>
                    <i className="ti ti-package"></i>
                    <span>Sản phẩm</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/service" className={activeTab === "service" ? "active" : ""} onClick={() => handleTabClick("service")}>
                    <i className="ti ti-briefcase"></i>
                    <span>Dịch vụ</span>
                  </NavLink>
                </li>
                {/* <li>
                  <NavLink to="/pipeline" className={activeTab === "pipeline" ? "active" : ""} onClick={() => handleTabClick("pipeline")}>
                    <i className="ti ti-timeline-event-exclamation"></i>
                    <span>Quy trình bán hàng</span>
                  </NavLink>
                </li> */}
                {/* <li>
                  <NavLink to="/project" className={activeTab === "project" ? "active" : ""} onClick={() => handleTabClick("project")}>
                    <i className="ti ti-atom-2"></i>
                    <span>Dự án</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/proposal" className={activeTab === "proposal" ? "active" : ""} onClick={() => handleTabClick("proposal")}>
                    <i className="ti ti-file-star"></i>
                    <span>Đề xuất</span>
                  </NavLink>
                </li> */}
                {/* 
                <li>
                  <a href="analytics.html">
                    <i className="ti ti-chart-bar"></i>
                    <span>Analytics</span>
                  </a>
                </li>
                 */}
              </ul>
            </li>
            {/* Reports Section */}
            <li className="menu-title">
              <span>Báo cáo</span>
            </li>
            <li>
              <ul>
                <li className="submenu">
                  <a
                    href="#"
                    className={openSubmenus.report ? "active subdrop" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuToggle("report");
                    }}
                  >
                    <i className="ti ti-report-analytics"></i>
                    <span>Báo cáo</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <SubMenuMotion open={openSubmenus.report}>
                    <li>
                      <NavLink
                        to="/lead-reports"
                        className={activeTab === "lead-reports" ? "active lead-reports-tab" : "lead-reports-tab"}
                        onClick={() => handleTabClick("lead-reports")}
                      >
                        Báo cáo khách hàng & doanh thu
                      </NavLink>
                    </li>
                    {/* <li>
                      <NavLink
                        to="/deal-reports"
                        className={activeTab === "deal-reports" ? "active deal-reports-tab" : "deal-reports-tab"}
                        onClick={() => handleTabClick("deal-reports")}
                      >
                        Báo cáo giao dịch
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/product-reports"
                        className={activeTab === "product-reports" ? "active product-reports-tab" : "product-reports-tab"}
                        onClick={() => handleTabClick("product-reports")}
                      >
                        Báo cáo sản phẩm
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/company-reports"
                        className={activeTab === "company-reports" ? "active company-reports-tab" : "company-reports-tab"}
                        onClick={() => handleTabClick("company-reports")}
                      >
                        Báo cáo chi nhánh
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/project-reports"
                        className={activeTab === "project-reports" ? "active project-reports-tab" : "project-reports-tab"}
                        onClick={() => handleTabClick("project-reports")}
                      >
                        Báo cáo dự án
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/task-reports"
                        className={activeTab === "task-reports" ? "active task-reports-tab" : "task-reports-tab"}
                        onClick={() => handleTabClick("task-reports")}
                      >
                        Báo cáo công việc
                      </NavLink>
                    </li> */}
                  </SubMenuMotion>
                </li>
              </ul>
            </li>
            {/* CRM Settings Section */}
            <li className="menu-title">
              <span>Cài đặt CRM</span>
            </li>
            <li>
              <ul>
                <li>
                  <NavLink to="/resources" className={activeTab === "resources" ? "active" : ""} onClick={() => handleTabClick("resources")}>
                    <i className="ti ti-artboard"></i>
                    <span>Tài nguyên</span>
                  </NavLink>
                </li>
                {/* <li>
                  <NavLink to="/lost-reason" className={activeTab === "lost-reason" ? "active" : ""} onClick={() => handleTabClick("lost-reason")}>
                    <i className="ti ti-message-exclamation"></i>
                    <span>Lý do mất khách</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contact-stage"
                    className={activeTab === "contact-stage" ? "active" : ""}
                    onClick={() => handleTabClick("contact-stage")}
                  >
                    <i className="ti ti-steam"></i>
                    <span>Giai đoạn liên hệ</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/industry" className={activeTab === "industry" ? "active" : ""} onClick={() => handleTabClick("industry")}>
                    <i className="ti ti-building-factory"></i>
                    <span>Ngành nghề</span>
                  </NavLink>
                </li> */}
                {/*
                <li>
                  <a href="calls.html">
                    <i className="ti ti-phone-check"></i>
                    <span>Calls</span>
                  </a>
                </li> */}
              </ul>
            </li>
            {/* User Management Section */}
            <li className="menu-title">
              <span>Quản lý người dùng</span>
            </li>
            <li>
              <ul>
                <li>
                  <NavLink
                    to="/manager-users"
                    className={activeTab === "manager-users" ? "active" : ""}
                    onClick={() => handleTabClick("manager-users")}
                  >
                    <i className="ti ti-users"></i>
                    <span>Tài khoản người dùng</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/roles-permissions"
                    className={activeTab === "roles-permissions" ? "active" : ""}
                    onClick={() => handleTabClick("roles-permissions")}
                  >
                    <i className="ti ti-user-shield"></i>
                    <span>Vai trò & Phân quyền</span>
                  </NavLink>
                </li>
                {/* <li>
                  <a href="delete-request.html">
                    <i className="ti ti-flag-question"></i>
                    <span>Delete Request</span>
                  </a>
                </li> */}
              </ul>
            </li>
            {/* Membership Section */}
            {/* <li className="menu-title">
              <span>Thành viên</span>
            </li>
            <li>
              <ul>
                <li className="submenu">
                  <a
                    href="#"
                    className={openSubmenus.membership ? "active subdrop" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuToggle("membership");
                    }}
                  >
                    <i className="ti ti-brand-apple-podcast"></i>
                    <span>Thành viên</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <SubMenuMotion open={openSubmenus.membership}>
                    <li>
                      <NavLink
                        to="/membership-plans"
                        className={activeTab === "membership-plans" ? "active membership-plans-tab" : "membership-plans-tab"}
                        onClick={() => handleTabClick("membership-plans")}
                      >
                        Gói thành viên
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/membership-addons"
                        className={activeTab === "membership-addons" ? "active membership-addons-tab" : "membership-addons-tab"}
                        onClick={() => handleTabClick("membership-addons")}
                      >
                        Gói bổ sung
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/membership-transactions"
                        className={activeTab === "membership-transactions" ? "active membership-transactions-tab" : "membership-transactions-tab"}
                        onClick={() => handleTabClick("membership-transactions")}
                      >
                        Giao dịch
                      </NavLink>
                    </li>
                  </SubMenuMotion>
                </li>
              </ul>
            </li> */}
            {/* Content Section */}
            {/* <li className="menu-title">
              <span>Content</span>
            </li>
            <li>
              <ul>
                <li>
                  <a href="pages.html">
                    <i className="ti ti-page-break"></i>
                    <span>Pages</span>
                  </a>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-brand-blogger"></i>
                    <span>Blog</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="blogs.html">All Blogs</a>
                    </li>
                    <li>
                      <a href="blog-categories.html">Blog Categories</a>
                    </li>
                    <li>
                      <a href="blog-comments.html">Blog Comments</a>
                    </li>
                    <li>
                      <a href="blog-tags.html">Blog Tags</a>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-map-pin-pin"></i>
                    <span>Location</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="countries.html">Countries</a>
                    </li>
                    <li>
                      <a href="states.html">States</a>
                    </li>
                    <li>
                      <a href="cities.html">Cities</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="testimonials.html">
                    <i className="ti ti-quote"></i>
                    <span>Testimonials</span>
                  </a>
                </li>
                <li>
                  <a href="faq.html">
                    <i className="ti ti-question-mark"></i>
                    <span>FAQ</span>
                  </a>
                </li>
              </ul>
            </li> */}
            {/* Support Section */}
            {/* <li className="menu-title">
              <span>Support</span>
            </li>
            <li>
              <ul>
                <li>
                  <a href="contact-messages.html">
                    <i className="ti ti-message-check"></i>
                    <span>Contact Messages</span>
                  </a>
                </li>
                <li>
                  <a href="tickets.html">
                    <i className="ti ti-ticket"></i>
                    <span>Tickets</span>
                  </a>
                </li>
              </ul>
            </li> */}
            {/* Settings Section */}
            <li className="menu-title">
              <span>Cài đặt</span>
            </li>
            <li>
              <ul>
                <li className="submenu">
                  <a
                    href="#"
                    className={openSubmenus.settings_general ? "active subdrop" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuToggle("settings_general");
                    }}
                  >
                    <i className="ti ti-settings-cog"></i>
                    <span>Cài đặt chung</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <SubMenuMotion open={openSubmenus.settings_general}>
                    <li>
                      <NavLink
                        to="/profile-settings"
                        className={activeTab === "profile-settings" ? "active profile-settings-tab" : "profile-settings-tab"}
                        onClick={() => handleTabClick("profile-settings")}
                      >
                        Hồ sơ
                      </NavLink>
                    </li>
                    {/* <li>
                      <NavLink
                        to="/security-settings"
                        className={activeTab === "security-settings" ? "active security-settings-tab" : "security-settings-tab"}
                        onClick={() => handleTabClick("security-settings")}
                      >
                        Bảo mật
                      </NavLink>
                    </li> */}
                    {/* <li>
                      <NavLink
                        to="/notifications-settings"
                        className={activeTab === "notifications-settings" ? "active notifications-settings-tab" : "notifications-settings-tab"}
                        onClick={() => handleTabClick("notifications-settings")}
                      >
                        Thông báo
                      </NavLink>
                    </li> */}
                  </SubMenuMotion>
                </li>
                {/* <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-world-cog"></i>
                    <span>Website Settings</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="company-settings.html">Company Settings</a>
                    </li>
                    <li>
                      <a href="localization-settings.html">Localization</a>
                    </li>
                    <li>
                      <a href="prefixes-settings.html">Prefixes</a>
                    </li>
                    <li>
                      <a href="preference-settings.html">Preference</a>
                    </li>
                    <li>
                      <a href="appearance-settings.html">Appearance</a>
                    </li>
                    <li>
                      <a href="language-settings.html">Language</a>
                    </li>
                  </ul>
                </li> */}
                {/* <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-apps"></i>
                    <span>App Settings</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="invoice-settings.html">Invoice Settings</a>
                    </li>
                    <li>
                      <a href="printers-settings.html">Printers</a>
                    </li>
                    <li>
                      <a href="custom-fields-setting.html">Custom Fields</a>
                    </li>
                  </ul>
                </li> */}
                <li className="submenu">
                  <a
                    href="#"
                    className={openSubmenus.system_settings ? "active subdrop" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmenuToggle("system_settings");
                    }}
                  >
                    <i className="ti ti-device-laptop"></i>
                    <span>Cài đặt hệ thống</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <SubMenuMotion open={openSubmenus.system_settings}>
                    <li>
                      <NavLink
                        to="/customer-settings"
                        className={activeTab === "customer-settings" ? "active customer-settings-tab" : "customer-settings-tab"}
                        onClick={() => handleTabClick("customer-settings")}
                        style={{ background: "none" }}
                      >
                        Cài đặt khách hàng
                      </NavLink>
                    </li>
                    {/* <li>
                      <a href="sms-gateways.html">SMS Gateways</a>
                    </li>
                    <li>
                      <a href="gdpr-cookies.html">GDPR Cookies</a>
                    </li> */}
                  </SubMenuMotion>
                </li>
                {/* <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-moneybag"></i>
                    <span>Financial Settings</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="payment-gateways.html">Payment Gateways</a>
                    </li>
                    <li>
                      <a href="bank-accounts.html">Bank Accounts</a>
                    </li>
                    <li>
                      <a href="tax-rates.html">Tax Rates</a>
                    </li>
                    <li>
                      <a href="currencies.html">Currencies</a>
                    </li>
                  </ul>
                </li> */}
                {/* <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-settings-2"></i>
                    <span>Other Settings</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="sitemap.html">Sitemap</a>
                    </li>
                    <li>
                      <a href="clear-cache.html">Clear Cache</a>
                    </li>
                    <li>
                      <a href="storage.html">Storage</a>
                    </li>
                    <li>
                      <a href="cronjob.html">Cronjob</a>
                    </li>
                    <li>
                      <a href="ban-ip-address.html">Ban IP Address</a>
                    </li>
                    <li>
                      <a href="system-backup.html">System Backup</a>
                    </li>
                    <li>
                      <a href="database-backup.html">Database Backup</a>
                    </li>
                    <li>
                      <a href="system-update.html">System Update</a>
                    </li>
                  </ul>
                </li> */}
              </ul>
            </li>
            {/* Pages Section */}
            {/* <li className="menu-title">
              <span>Pages</span>
            </li>
            <li>
              <ul>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-lock-square-rounded"></i>
                    <span>Authentication</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="login.html">Login</a>
                    </li>
                    <li>
                      <a href="register.html">Register</a>
                    </li>
                    <li>
                      <a href="forgot-password.html">Forgot Password</a>
                    </li>
                    <li>
                      <a href="reset-password.html">Reset Password</a>
                    </li>
                    <li>
                      <a href="email-verification.html">Email Verification</a>
                    </li>
                    <li>
                      <a href="two-step-verification.html">2 Step Verification</a>
                    </li>
                    <li>
                      <a href="lock-screen.html">Lock Screen</a>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-error-404"></i>
                    <span>Error Pages</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="error-404.html">404 Error</a>
                    </li>
                    <li>
                      <a href="error-500.html">500 Error</a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="blank-page.html">
                    <i className="ti ti-file"></i>
                    <span>Blank Page</span>
                  </a>
                </li>
                <li>
                  <a href="coming-soon.html">
                    <i className="ti ti-inner-shadow-top-right"></i>
                    <span>Coming Soon</span>
                  </a>
                </li>
                <li>
                  <a href="under-maintenance.html">
                    <i className="ti ti-info-triangle"></i>
                    <span>Under Maintenance</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className="menu-title">
              <span>UI Interface</span>
            </li>
            <li>
              <ul>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-hierarchy"></i>
                    <span>Base UI</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="ui-accordion.html">Accordion</a>
                    </li>
                    <li>
                      <a href="ui-alerts.html">Alerts</a>
                    </li>
                    <li>
                      <a href="ui-avatar.html">Avatar</a>
                    </li>
                    <li>
                      <a href="ui-badges.html">Badges</a>
                    </li>
                    <li>
                      <a href="ui-breadcrumb.html">Breadcrumb</a>
                    </li>
                    <li>
                      <a href="ui-buttons.html">Buttons</a>
                    </li>
                    <li>
                      <a href="ui-buttons-group.html">Button Group</a>
                    </li>
                    <li>
                      <a href="ui-cards.html">Card</a>
                    </li>
                    <li>
                      <a href="ui-carousel.html">Carousel</a>
                    </li>
                    <li>
                      <a href="ui-collapse.html">Collapse</a>
                    </li>
                    <li>
                      <a href="ui-dropdowns.html">Dropdowns</a>
                    </li>
                    <li>
                      <a href="ui-ratio.html">Ratio</a>
                    </li>
                    <li>
                      <a href="ui-grid.html">Grid</a>
                    </li>
                    <li>
                      <a href="ui-images.html">Images</a>
                    </li>
                    <li>
                      <a href="ui-links.html">Links</a>
                    </li>
                    <li>
                      <a href="ui-list-group.html">List Group</a>
                    </li>
                    <li>
                      <a href="ui-modals.html">Modals</a>
                    </li>
                    <li>
                      <a href="ui-offcanvas.html">Offcanvas</a>
                    </li>
                    <li>
                      <a href="ui-pagination.html">Pagination</a>
                    </li>
                    <li>
                      <a href="ui-placeholders.html">Placeholders</a>
                    </li>
                    <li>
                      <a href="ui-popovers.html">Popovers</a>
                    </li>
                    <li>
                      <a href="ui-progress.html">Progress</a>
                    </li>
                    <li>
                      <a href="ui-scrollspy.html">Scrollspy</a>
                    </li>
                    <li>
                      <a href="ui-spinner.html">Spinner</a>
                    </li>
                    <li>
                      <a href="ui-nav-tabs.html">Tabs</a>
                    </li>
                    <li>
                      <a href="ui-toasts.html">Toasts</a>
                    </li>
                    <li>
                      <a href="ui-tooltips.html">Tooltips</a>
                    </li>
                    <li>
                      <a href="ui-typography.html">Typography</a>
                    </li>
                    <li>
                      <a href="ui-utilities.html">Utilities</a>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-whirl"></i>
                    <span>Advanced UI</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="ui-dragula.html">Dragula</a>
                    </li>
                    <li>
                      <a href="ui-clipboard.html">Clipboard</a>
                    </li>
                    <li>
                      <a href="ui-rangeslider.html">Range Slider</a>
                    </li>
                    <li>
                      <a href="ui-sweetalerts.html">Sweet Alerts</a>
                    </li>
                    <li>
                      <a href="ui-lightbox.html">Lightbox</a>
                    </li>
                    <li>
                      <a href="ui-rating.html">Rating</a>
                    </li>
                    <li>
                      <a href="ui-scrollbar.html">Scrollbar</a>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-forms"></i>
                    <span>Forms</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li className="submenu submenu-two">
                      <a href="javascript:void(0);">
                        Form Elements
                        <span className="menu-arrow inside-submenu"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="form-basic-inputs.html">Basic Inputs</a>
                        </li>
                        <li>
                          <a href="form-checkbox-radios.html">Checkbox & Radios</a>
                        </li>
                        <li>
                          <a href="form-input-groups.html">Input Groups</a>
                        </li>
                        <li>
                          <a href="form-grid-gutters.html">Grid & Gutters</a>
                        </li>
                        <li>
                          <a href="form-mask.html">Input Masks</a>
                        </li>
                        <li>
                          <a href="form-fileupload.html">File Uploads</a>
                        </li>
                      </ul>
                    </li>
                    <li className="submenu submenu-two">
                      <a href="javascript:void(0);">
                        Layouts
                        <span className="menu-arrow inside-submenu"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="form-horizontal.html">Horizontal Form</a>
                        </li>
                        <li>
                          <a href="form-vertical.html">Vertical Form</a>
                        </li>
                        <li>
                          <a href="form-floating-labels.html">Floating Labels</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="form-validation.html">Form Validation</a>
                    </li>
                    <li>
                      <a href="form-select.html">Form Select</a>
                    </li>
                    <li>
                      <a href="form-wizard.html">Form Wizard</a>
                    </li>
                    <li>
                      <a href="form-pickers.html">Form Picker</a>
                    </li>
                    <li>
                      <a href="form-editors.html">Form Editors</a>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-table"></i>
                    <span>Tables</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="tables-basic.html">Basic Tables </a>
                    </li>
                    <li>
                      <a href="data-tables.html">Data Table </a>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-chart-pie-3"></i>
                    <span>Charts</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="chart-apex.html">Apex Charts</a>
                    </li>
                    <li>
                      <a href="chart-c3.html">Chart C3</a>
                    </li>
                    <li>
                      <a href="chart-js.html">Chart Js</a>
                    </li>
                    <li>
                      <a href="chart-morris.html">Morris Charts</a>
                    </li>
                    <li>
                      <a href="chart-flot.html">Flot Charts</a>
                    </li>
                    <li>
                      <a href="chart-peity.html">Peity Charts</a>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-icons"></i>
                    <span>Icons</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="icon-fontawesome.html">Fontawesome Icons</a>
                    </li>
                    <li>
                      <a href="icon-tabler.html">Tabler Icons</a>
                    </li>
                    <li>
                      <a href="icon-bootstrap.html">Bootstrap Icons</a>
                    </li>
                    <li>
                      <a href="icon-remix.html">Remix Icons</a>
                    </li>
                    <li>
                      <a href="icon-feather.html">Feather Icons</a>
                    </li>
                    <li>
                      <a href="icon-ionic.html">Ionic Icons</a>
                    </li>
                    <li>
                      <a href="icon-material.html">Material Icons</a>
                    </li>
                    <li>
                      <a href="icon-pe7.html">Pe7 Icons</a>
                    </li>
                    <li>
                      <a href="icon-simpleline.html">Simpleline Icons</a>
                    </li>
                    <li>
                      <a href="icon-themify.html">Themify Icons</a>
                    </li>
                    <li>
                      <a href="icon-weather.html">Weather Icons</a>
                    </li>
                    <li>
                      <a href="icon-typicon.html">Typicon Icons</a>
                    </li>
                    <li>
                      <a href="icon-flag.html">Flag Icons</a>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-map-star"></i>
                    <span>Maps</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="maps-vector.html">Vector</a>
                    </li>
                    <li>
                      <a href="maps-leaflet.html">Leaflet</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li> */}
            {/* Help Section */}
            {/* <li className="menu-title">
              <span>Help</span>
            </li>
            <li>
              <ul>
                <li>
                  <a href="javascript:void(0);">
                    <i className="ti ti-file-stack"></i>
                    <span>Documentation</span>
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0);">
                    <i className="ti ti-arrow-capsule"></i>
                    <span>Changelog v2.2.7</span>
                  </a>
                </li>
                <li className="submenu">
                  <a href="javascript:void(0);">
                    <i className="ti ti-menu-deep"></i>
                    <span>Multi Level</span>
                    <span className="menu-arrow"></span>
                  </a>
                  <ul>
                    <li>
                      <a href="javascript:void(0);">Level 1.1</a>
                    </li>
                    <li className="submenu submenu-two">
                      <a href="javascript:void(0);">
                        Level 1.2
                        <span className="menu-arrow inside-submenu"></span>
                      </a>
                      <ul>
                        <li>
                          <a href="javascript:void(0);">Level 2.1</a>
                        </li>
                        <li className="submenu submenu-two submenu-three">
                          <a href="javascript:void(0);">
                            Level 2.2
                            <span className="menu-arrow inside-submenu inside-submenu-two"></span>
                          </a>
                          <ul>
                            <li>
                              <a href="javascript:void(0);">Level 3.1</a>
                            </li>
                            <li>
                              <a href="javascript:void(0);">Level 3.2</a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </li> */}
          </ul>
        </div>
      </SimpleBar>
    </div>
  );
}
