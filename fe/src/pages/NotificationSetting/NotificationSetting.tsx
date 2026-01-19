import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";

// 1. Định nghĩa Type & Data
interface INotificationSetting {
  id: number;
  label: string;
  checked: boolean;
}

interface ICustomNotification {
  id: number;
  title: string;
  push: boolean;
  sms: boolean;
  email: boolean;
}

const generalData: INotificationSetting[] = [
  { id: 1, label: "Mobile Push Notifications", checked: true },
  { id: 2, label: "Desktop Notifications", checked: true },
  { id: 3, label: "Email Notifications", checked: true },
  { id: 4, label: "SMS Notifications", checked: true },
];

const customData: ICustomNotification[] = [
  { id: 1, title: "Payment", push: true, sms: true, email: true },
  { id: 2, title: "Transaction", push: true, sms: true, email: true },
  { id: 3, title: "Email Verification", push: true, sms: true, email: true },
  { id: 4, title: "OTP", push: true, sms: true, email: true },
  { id: 5, title: "Activity", push: true, sms: true, email: true },
  { id: 6, title: "Account", push: true, sms: true, email: true },
];

export default function NotificationSettings() {
  // State quản lý các checkbox (trong thực tế sẽ lấy từ API)
  const [generalNotifs, setGeneralNotifs] = useState(generalData);
  const [customNotifs] = useState(customData);

  const handleGeneralToggle = (id: number) => {
    setGeneralNotifs((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">Settings</h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <Link to="/">Home</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Settings
                  </li>
                </ol>
              </nav>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <a href="#" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="tooltip" title="Refresh">
                <i className="ti ti-refresh"></i>
              </a>
              <a href="#" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="tooltip" title="Collapse" id="collapse-header">
                <i className="ti ti-transition-top"></i>
              </a>
            </div>
          </div>
          {/* End Page Header */}

          {/* Top Navigation Tabs */}
          <div className="card border-0">
            <div className="card-body pb-0 pt-0 px-2">
              <ul className="nav nav-tabs nav-bordered nav-bordered-primary">
                <li className="nav-item me-3">
                  <Link to="/profile-settings" className="nav-link p-2 active">
                    <i className="ti ti-settings-cog me-2"></i>General Settings
                  </Link>
                </li>
                <li className="nav-item me-3">
                  <Link to="/company-settings" className="nav-link p-2">
                    <i className="ti ti-world-cog me-2"></i>Website Settings
                  </Link>
                </li>
                <li className="nav-item me-3">
                  <Link to="/invoice-settings" className="nav-link p-2">
                    <i className="ti ti-apps me-2"></i>App Settings
                  </Link>
                </li>
                <li className="nav-item me-3">
                  <Link to="/email-settings" className="nav-link p-2">
                    <i className="ti ti-device-laptop me-2"></i>System Settings
                  </Link>
                </li>
                <li className="nav-item me-3">
                  <Link to="/payment-gateways" className="nav-link p-2">
                    <i className="ti ti-moneybag me-2"></i>Financial Settings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/sitemap" className="nav-link p-2">
                    <i className="ti ti-flag-cog me-2"></i>Other Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* End Top Navigation Tabs */}

          {/* Main Content Row */}
          <div className="row">
            {/* Left Sidebar Settings */}
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              <div className="card mb-3 mb-xl-0">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h5 className="mb-3 fs-17">General Settings</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <Link to="/profile-settings" className="d-block p-2 fw-medium">
                        Profile
                      </Link>
                      <Link to="/security-settings" className="d-block p-2 fw-medium">
                        Security
                      </Link>
                      <Link to="/notifications-settings" className="d-block p-2 fw-medium active">
                        Notifications
                      </Link>
                      <Link to="/connected-apps" className="d-block p-2 fw-medium">
                        Connected Apps
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Panel */}
            <div className="col-xl-9 col-lg-12">
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3">
                    <h5 className="mb-0 fs-17">Notification Settings</h5>
                  </div>
                  <div>
                    {/* General Notifications */}
                    <div className="mb-3">
                      <h6 className="mb-1">General Notifications</h6>
                      <p className="mb-0">Select notifications</p>
                    </div>
                    <div className="border-bottom mb-3 pb-3">
                      {generalNotifs.map((item) => (
                        <div key={item.id} className="form-check d-flex align-items-center justify-content-between ps-0 mb-3 last:mb-0">
                          <label className="form-check-label text-dark fw-medium" htmlFor={`notification${item.id}`}>
                            {item.label}
                          </label>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`notification${item.id}`}
                            checked={item.checked}
                            onChange={() => handleGeneralToggle(item.id)}
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Custom Notifications Table */}
                    <div className="mb-3">
                      <h6 className="mb-1">Custom Notifications</h6>
                      <p className="mb-0">Select when you will be notified when the following changes occur</p>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-borderless notification-table border-0">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Push</th>
                            <th>SMS</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customNotifs.map((row) => (
                            <tr key={row.id}>
                              <td className="fw-medium text-dark py-2">{row.title}</td>
                              <td className="py-2">
                                <div className="form-check form-switch">
                                  <input className="form-check-input" type="checkbox" role="switch" defaultChecked={row.push} />
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="form-check form-switch">
                                  <input className="form-check-input" type="checkbox" role="switch" defaultChecked={row.sms} />
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="form-check form-switch">
                                  <input className="form-check-input" type="checkbox" role="switch" defaultChecked={row.email} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End Right Content Panel */}
          </div>
          {/* End Main Content Row */}
        </div>
        <Footer />
      </div>
    </div>
  );
}
