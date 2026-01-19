import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../store";
import "./Header.scss";

export default function Header() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useAppSelector((state) => state.user);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Khi darkMode thay đổi, cập nhật data-bs-theme của html
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.setAttribute("data-bs-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDropdownOpen((open) => !open);
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Hàm xử lý Đăng xuất
  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "/login";
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    const doc = document as Document & {
      mozFullScreenElement?: Element;
      webkitFullscreenElement?: Element;
      msFullscreenElement?: Element;
      mozCancelFullScreen?: () => Promise<void>;
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };
    const docEl = document.documentElement as HTMLElement & {
      mozRequestFullScreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  };

  return (
    <header className="navbar-header">
      <div className="page-container topbar-menu">
        <div className="d-flex align-items-center gap-2">
          {/* Logo */}
          <a href="index.html" className="logo">
            {/* Logo Normal */}
            <span className="logo-light">
              <span className="logo-lg">
                <img src="assets/img/logo.svg" alt="logo" />
              </span>
              <span className="logo-sm">
                <img src="assets/img/logo-small.svg" alt="small logo" />
              </span>
            </span>
            {/* Logo Dark */}
            <span className="logo-dark">
              <span className="logo-lg">
                <img src="assets/img/logo-white.svg" alt="dark logo" />
              </span>
            </span>
          </a>

          {/* Sidebar Mobile Button */}
          <a id="mobile_btn" className="mobile-btn" href="#sidebar">
            <i className="ti ti-menu-deep fs-24"></i>
          </a>

          <button className="sidenav-toggle-btn btn border-0 p-0" id="toggle_btn2">
            <i className="ti ti-arrow-bar-to-right"></i>
          </button>

          {/* Search */}
          <div className="me-auto d-flex align-items-center header-search d-lg-flex d-none">
            <div className="input-icon position-relative me-2">
              <input type="text" className="form-control" placeholder="Tìm kiếm" />
              <span className="input-icon-addon d-inline-flex p-0 header-search-icon">
                <i className="ti ti-command"></i>
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center">
          {/* Search for Mobile */}
          <div className="header-item d-flex d-lg-none me-2">
            <button className="topbar-link btn" data-bs-toggle="modal" data-bs-target="#searchModal" type="button">
              <i className="ti ti-search fs-16"></i>
            </button>
          </div>

          {/* Minimize */}
          <div className="header-item">
            <div className="dropdown me-2">
              <a href="javascript:void(0);" className="btn topbar-link btnFullscreen" onClick={toggleFullscreen}>
                <i className="ti ti-maximize"></i>
              </a>
            </div>
          </div>

          {/* Light/Dark Mode Button */}
          <div className="header-item d-none d-sm-flex me-2">
            <button className="topbar-link btn topbar-link" id="light-dark-mode" type="button" onClick={toggleDarkMode}>
              <i className={`${darkMode ? "ti ti-sun" : "ti ti-moon"} fs-16`}></i>
            </button>
          </div>

          {/* Pages Dropdown */}
          <div className="header-item d-none d-sm-flex">
            <div className="dropdown me-2">
              <a href="javascript:void(0);" className="btn topbar-link topbar-teal-link" data-bs-toggle="dropdown">
                <i className="ti ti-layout-grid-add"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                {/* Item */}
                <a href="#" className="dropdown-item">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="d-flex mb-1 fw-semibold text-dark">Contacts</span>
                      <span className="fs-13">View All the Contacts</span>
                    </div>
                    <i className="ti ti-chevron-right-pipe text-dark"></i>
                  </div>
                </a>
                {/* Item */}
                <a href="pipeline.html" className="dropdown-item">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="d-flex mb-1 fw-semibold text-dark">Pipeline</span>
                      <span className="fs-13">View All the Pipeline</span>
                    </div>
                    <i className="ti ti-chevron-right-pipe text-dark"></i>
                  </div>
                </a>
                {/* Item */}
                <a href="activities.html" className="dropdown-item">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="d-flex mb-1 fw-semibold text-dark">Activities</span>
                      <span className="fs-13">Activities</span>
                    </div>
                    <i className="ti ti-chevron-right-pipe text-dark"></i>
                  </div>
                </a>
                {/* Item */}
                <a href="analytics.html" className="dropdown-item">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="d-flex mb-1 fw-semibold text-dark">Analytics</span>
                      <span className="fs-13">Analytics</span>
                    </div>
                    <i className="ti ti-chevron-right-pipe text-dark"></i>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="header-item d-none d-sm-flex">
            <div className="dropdown me-2">
              <a href="#" className="btn topbar-link topbar-indigo-link">
                <i className="ti ti-help-hexagon"></i>
              </a>
            </div>
          </div>

          {/* Report */}
          <div className="header-item d-none d-sm-flex">
            <div className="dropdown me-2">
              <a href="#" className="btn topbar-link topbar-warning-link">
                <i className="ti ti-chart-pie"></i>
              </a>
            </div>
          </div>

          <div className="header-line"></div>

          {/* Messages */}
          <div className="header-item">
            <div className="dropdown me-2">
              <a href="#" className="btn topbar-link">
                <i className="ti ti-message-circle-exclamation"></i>
                <span className="badge rounded-pill">14</span>
              </a>
            </div>
          </div>

          {/* Notifications */}
          <div className="header-item">
            <div className="dropdown me-2">
              <button
                className="topbar-link btn topbar-link dropdown-toggle drop-arrow-none"
                data-bs-toggle="dropdown"
                data-bs-offset="0,24"
                type="button"
                aria-haspopup="false"
                aria-expanded="false"
              >
                <i className="ti ti-bell-check fs-16 animate-ring"></i>
                <span className="badge rounded-pill">10</span>
              </button>
              <div className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg" style={{ minHeight: 300 }}>
                <div className="p-2 border-bottom">
                  <div className="row align-items-center">
                    <div className="col">
                      <h6 className="m-0 fs-16 fw-semibold"> Notifications</h6>
                    </div>
                  </div>
                </div>
                {/* Notification Body */}
                <div className="notification-body position-relative z-2 rounded-0" data-simplebar>
                  {/* Item */}
                  <div className="dropdown-item notification-item py-3 text-wrap border-bottom" id="notification-1">
                    <div className="d-flex">
                      <div className="me-2 position-relative flex-shrink-0">
                        <img src="assets/img/users/user-01.jpg" className="avatar-md rounded-circle" alt="Img" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-medium text-dark">John Doe</p>
                        <p className="mb-1 text-wrap">
                          left 6 comments on <span className="fw-medium text-dark">Isla Nublar SOC2 compliance report</span>
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fs-12">
                            <i className="ti ti-clock me-1"></i>4 min ago
                          </span>
                          <div className="notification-action d-flex align-items-center float-end gap-2">
                            <a
                              href="javascript:void(0);"
                              className="notification-read rounded-circle bg-danger"
                              data-bs-toggle="tooltip"
                              title=""
                              data-bs-original-title="Make as Read"
                              aria-label="Make as Read"
                            ></a>
                            <button className="btn rounded-circle p-0" data-dismissible="#notification-1">
                              <i className="ti ti-x"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Item */}
                  <div className="dropdown-item notification-item py-3 text-wrap border-bottom" id="notification-2">
                    <div className="d-flex">
                      <div className="me-2 position-relative flex-shrink-0">
                        <img src="assets/img/users/user-12.jpg" className="avatar-md rounded-circle" alt="Img" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-medium text-dark">Thomas William</p>
                        <p className="mb-1 text-wrap">
                          “Oh, I finished de-bugging the phones, but the system's compiling for eighteen minutes, or twenty...”
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fs-12">
                            <i className="ti ti-clock me-1"></i>8 min ago
                          </span>
                          <div className="notification-action d-flex align-items-center float-end gap-2">
                            <a
                              href="javascript:void(0);"
                              className="notification-read rounded-circle bg-danger"
                              data-bs-toggle="tooltip"
                              title=""
                              data-bs-original-title="Make as Read"
                              aria-label="Make as Read"
                            ></a>
                            <button className="btn rounded-circle p-0" data-dismissible="#notification-2">
                              <i className="ti ti-x"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Item */}
                  <div className="dropdown-item notification-item py-3 text-wrap border-bottom" id="notification-3">
                    <div className="d-flex">
                      <div className="me-2 position-relative flex-shrink-0">
                        <img src="assets/img/profiles/avatar-12.jpg" className="avatar-md rounded-circle" alt="Img" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-medium text-dark">Sarah Anderson</p>
                        <p className="mb-1 text-wrap">
                          attached a file to <span className="fw-medium text-dark">Isla Nublar SOC2 compliance report</span>
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fs-12">
                            <i className="ti ti-clock me-1"></i>15 min ago
                          </span>
                          <div className="notification-action d-flex align-items-center float-end gap-2">
                            <a
                              href="javascript:void(0);"
                              className="notification-read rounded-circle bg-danger"
                              data-bs-toggle="tooltip"
                              title=""
                              data-bs-original-title="Make as Read"
                              aria-label="Make as Read"
                            ></a>
                            <button className="btn rounded-circle p-0" data-dismissible="#notification-3">
                              <i className="ti ti-x"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Item */}
                  <div className="dropdown-item notification-item py-3 text-wrap" id="notification-4">
                    <div className="d-flex">
                      <div className="me-2 position-relative flex-shrink-0">
                        <img src="assets/img/profiles/avatar-08.jpg" className="avatar-md rounded-circle" alt="Img" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-medium text-dark">Ann McClure</p>
                        <p className="mb-1 text-wrap">
                          mentioned you in <span className="fw-medium text-dark">Bug Fix Review - Task #432</span>
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fs-12">
                            <i className="ti ti-clock me-1"></i>20 min ago
                          </span>
                          <div className="notification-action d-flex align-items-center float-end gap-2">
                            <a
                              href="javascript:void(0);"
                              className="notification-read rounded-circle bg-danger"
                              data-bs-toggle="tooltip"
                              title=""
                              data-bs-original-title="Make as Read"
                              aria-label="Make as Read"
                            ></a>
                            <button className="btn rounded-circle p-0" data-dismissible="#notification-4">
                              <i className="ti ti-x"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* View All */}
                <div className="p-2 rounded-bottom border-top text-center">
                  <a href="notifications.html" className="text-center text-decoration-underline fs-14 mb-0">
                    View All Notifications
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* User Dropdown */}
          <div className="header-item dropdown profile-dropdown d-flex align-items-center justify-content-center" ref={dropdownRef}>
            <a
              href="javascript:void(0);"
              className="topbar-link dropdown-toggle drop-arrow-none position-relative"
              data-bs-toggle="dropdown"
              data-bs-offset="0,22"
              onClick={handleToggleDropdown}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <img src={user.avatar || "assets/img/users/user-40.jpg"} width="38" className="rounded-1 d-flex" alt="user-image" />
              <span className="online text-success">
                <i className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white" style={{ fontSize: 12 }}></i>
              </span>
            </a>
            <div className={`dropdown-menu dropdown-menu-end dropdown-menu-md p-2${dropdownOpen ? " show" : ""}`}>
              <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                <img src={user.avatar || "assets/img/users/user-40.jpg"} className="rounded-circle" width="42" height="42" alt="Img" />
                <div className="ms-2">
                  <p className="fw-medium text-dark mb-0">{user.name}</p>
                  <span className="d-block fs-13">{user.roleName}</span>
                </div>
              </div>
              <a href="profile-settings" className="dropdown-item">
                <i className="ti ti-user-circle me-1 align-middle"></i>
                <span className="align-middle">Cài đặt hồ sơ</span>
              </a>
              <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between dropdown-item mb-0">
                <label className="form-check-label" htmlFor="notify">
                  <i className="ti ti-bell"></i>Thông báo
                </label>
                <input className="form-check-input me-0" type="checkbox" role="switch" id="notify" />
              </div>
              <a href="#" className="dropdown-item">
                <i className="ti ti-help-circle me-1 align-middle"></i>
                <span className="align-middle">Trợ giúp & Hỗ trợ</span>
              </a>
              <a href="profile-settings" className="dropdown-item">
                <i className="ti ti-settings me-1 align-middle"></i>
                <span className="align-middle">Cài đặt</span>
              </a>
              <div className="pt-2 mt-2 border-top">
                <a href="login" onClick={handleLogout} className="dropdown-item text-danger">
                  <i className="ti ti-logout me-1 fs-17 align-middle"></i>
                  <span className="align-middle">Đăng xuất</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
