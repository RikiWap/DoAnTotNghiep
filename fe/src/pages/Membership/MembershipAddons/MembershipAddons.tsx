import { Link } from "react-router-dom";
import Header from "../../../components/Header/Header";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Footer from "../../../components/Footer/Footer";

// Danh sách các addon để render vòng lặp
const addonsList = [
  { id: 1, label: "Contacts" },
  { id: 2, label: "Leads" },
  { id: 3, label: "Companies" },
  { id: 4, label: "Compaigns" }, // Giữ nguyên chính tả từ HTML gốc
  { id: 5, label: "Projects" },
  { id: 6, label: "Deals" },
  { id: 7, label: "Tasks" },
  { id: 8, label: "Pipelines" },
];

export default function MembershipAddons() {
  return (
    <div className="main-wrapper">
      {/* Topbar */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Page Wrapper */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content pb-0">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              {/* Card Start */}
              <div className="card border-0 rounded-0">
                <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
                  <h6 className="fs-18 mb-0">Membership Addons</h6>
                  <Link to="/membership-plans" className="btn btn-primary btn-sm">
                    Back<i className="ti ti-chevron-right ms-1"></i>
                  </Link>
                </div>
                <form action="#">
                  <div className="card-body pb-0">
                    <div className="row">
                      {addonsList.map((addon) => (
                        <div className="col-md-6" key={addon.id}>
                          <div className="mb-3">
                            <label className="form-label">
                              {addon.label} <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex align-items-center">
                              <input type="text" className="form-control" defaultValue="0-100" />
                              <div className="form-check form-switch ms-2">
                                <input className="form-check-input" type="checkbox" role="switch" />
                              </div>
                            </div>
                            <div className="form-check mt-1">
                              <input type="checkbox" className="form-check-input" id={`customCheck${addon.id}`} />
                              <label className="form-check-label" htmlFor={`customCheck${addon.id}`}>
                                Unlimited
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card-footer d-flex align-items-center justify-content-end">
                    <button type="button" className="btn btn-light btn-sm me-2">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Create New
                    </button>
                  </div>
                </form>
              </div>
              {/* Card End */}
            </div>
          </div>
        </div>
        {/* End Content */}

        {/* Footer */}
        <Footer />
      </div>
      {/* End Page Wrapper */}
    </div>
  );
}
