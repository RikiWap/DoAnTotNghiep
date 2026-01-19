import { useState } from "react";
import Header from "../../../components/Header/Header";
import Sidebar from "../../../components/Sidebar/Sidebar";
import Footer from "../../../components/Footer/Footer";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: number;
  features: PlanFeature[];
}

const plansData: Plan[] = [
  {
    name: "Cơ bản",
    price: 50,
    features: [
      { text: "10 Contacts", included: true },
      { text: "10 Leads", included: true },
      { text: "20 Companies", included: true },
      { text: "50 Compaigns", included: true },
      { text: "100 Projects", included: true },
      { text: "Deals", included: false },
      { text: "Tasks", included: false },
      { text: "Pipelines", included: false },
    ],
  },
  {
    name: "Doanh nghiệp vừa",
    price: 200,
    features: [
      { text: "20 Contacts", included: true },
      { text: "20 Leads", included: true },
      { text: "50 Companies", included: true },
      { text: "Unlimited Compaigns", included: true },
      { text: "Unlimited Projects", included: true },
      { text: "Deals", included: false },
      { text: "Tasks", included: false },
      { text: "Pipelines", included: false },
    ],
  },
  {
    name: "Doanh nghiệp lớn",
    price: 400,
    features: [
      { text: "Unlimited Contacts", included: true },
      { text: "Unlimited Leads", included: true },
      { text: "Unlimited Companies", included: true },
      { text: "Unlimited Compaigns", included: true },
      { text: "Unlimited Projects", included: true },
      { text: "Deals", included: true },
      { text: "Tasks", included: true },
      { text: "Pipelines", included: true },
    ],
  },
];

export default function MembershipPlans() {
  // State quản lý toggle Yearly/Monthly
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="main-wrapper">
      {/* Topbar */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content pb-0">
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Membership Plans
                <span className="badge badge-soft-primary ms-2">152</span>
              </h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <a href="/">Home</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Membership plans
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
              <a
                href="#"
                className="btn btn-icon btn-outline-light shadow"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Refresh"
                title="Refresh"
              >
                <i className="ti ti-refresh"></i>
              </a>
              <a
                href="#"
                className="btn btn-icon btn-outline-light shadow"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                aria-label="Collapse"
                title="Collapse"
                id="collapse-header"
              >
                <i className="ti ti-transition-top"></i>
              </a>
            </div>
          </div>
          {/* End Page Header */}

          {/* Card Start */}
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <div className="input-icon input-icon-start position-relative">
                <span className="input-icon-addon text-dark">
                  <i className="ti ti-search"></i>
                </span>
                <input type="text" className="form-control" placeholder="Search" />
              </div>
              <a href="#" className="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_add">
                <i className="ti ti-square-rounded-plus-filled me-1"></i>Add Membership
              </a>
            </div>
            <div className="card-body pb-0">
              <div className="d-block">
                {/* Toggle Switch */}
                <div className="d-flex align-items-center justify-content-center mb-4">
                  <p className={`mb-0 ${isYearly ? "text-dark fw-bold" : "text-muted"}`}>Yearly</p>
                  <div className="form-check form-switch ms-2 me-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={!isYearly}
                      onChange={() => setIsYearly(!isYearly)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <p className={`mb-0 ${!isYearly ? "text-dark fw-bold" : "text-muted"}`}>Monthly</p>
                </div>

                {/* Pricing Cards */}
                <div className="row justify-content-center">
                  {plansData.map((plan, index) => (
                    <div className="col-lg-4 col-md-6" key={index}>
                      <div className="card">
                        <div className="card-body">
                          <div className="text-center border-bottom pb-3 mb-3">
                            <span>{plan.name}</span>
                            <h5 className="d-flex align-items-center mb-0 justify-content-center mt-1">
                              ${isYearly ? plan.price * 12 : plan.price} <span className="fs-14 fw-medium ms-1">/ {isYearly ? "year" : "month"}</span>
                            </h5>
                          </div>
                          <div className="d-block">
                            <div>
                              {plan.features.map((feature, idx) => (
                                <p
                                  key={idx}
                                  className={`d-flex align-items-center fs-16 ${
                                    feature.included ? "text-dark fw-medium" : "fw-medium text-muted"
                                  } mb-2`}
                                >
                                  <span className="me-1">
                                    {feature.included ? (
                                      <i className="ti ti-circle-check-filled text-success"></i>
                                    ) : (
                                      <i className="ti ti-xbox-x-filled text-body"></i>
                                    )}
                                  </span>
                                  {feature.included ? feature.text : <del>{feature.text}</del>}
                                </p>
                              ))}
                            </div>
                            <div className="text-center mt-3">
                              <a href="#" className="btn btn-primary w-100">
                                Choose
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Card End */}
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Add Plan Offcanvas */}
      <div className="offcanvas offcanvas-end offcanvas-large" tabIndex={-1} id="offcanvas_add">
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">Add New Plan</h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form>
            <div className="accordion accordion-bordered" id="main_accordion">
              {/* Basic Info */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <a href="#" className="accordion-button accordion-custom-button rounded" data-bs-toggle="collapse" data-bs-target="#basic">
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-file-description"></i>
                    </span>
                    Plan Info
                  </a>
                </div>
                <div className="accordion-collapse collapse show" id="basic" data-bs-parent="#main_accordion">
                  <div className="accordion-body border-top pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Plan Name <span className="text-danger">*</span>
                          </label>
                          <input type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Plan Type <span className="text-danger">*</span>
                          </label>
                          <select className="form-select">
                            <option>Select</option>
                            <option>Basic</option>
                            <option>Business</option>
                            <option>Enterprise</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Plan Price <span className="text-danger">*</span>
                          </label>
                          <select className="form-select">
                            <option>Select</option>
                            <option>$50</option>
                            <option>$200</option>
                            <option>$400</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Basic Info */}

              {/* Plan Settings */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <a href="#" className="accordion-button accordion-custom-button rounded" data-bs-toggle="collapse" data-bs-target="#address">
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-settings"></i>
                    </span>
                    Plan Settings
                  </a>
                </div>
                <div className="accordion-collapse collapse" id="address" data-bs-parent="#main_accordion">
                  <div className="accordion-body border-top pb-0">
                    <div className="row">
                      {/* Helper function to render input group to reduce repetitive code */}
                      {["Contacts", "Leads", "Companies", "Compaigns", "Projects", "Deals", "Tasks", "Pipelines"].map((label, i) => (
                        <div className="col-md-6" key={i}>
                          <div className="mb-3">
                            <label className="form-label">
                              {label} <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex align-items-center">
                              <input type="text" className="form-control" defaultValue="0-100" />
                              <div className="form-check form-switch ms-2">
                                <input className="form-check-input" type="checkbox" role="switch" />
                              </div>
                            </div>
                            <div className="form-check mt-1">
                              <input type="checkbox" className="form-check-input" id={`customCheck${i}`} />
                              <label className="form-check-label" htmlFor={`customCheck${i}`}>
                                Unlimited
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* /Plan Settings */}
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button type="button" data-bs-dismiss="offcanvas" className="btn btn-light me-2">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create New
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Add Plan Offcanvas */}
    </div>
  );
}
