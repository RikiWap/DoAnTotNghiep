import { useState } from "react";
import type { FormEvent } from "react";
import { showToast } from "./../../utils/common";
import { useNavigate } from "react-router-dom";
import UserService from "../../services/UserService";
import type { IUserRegisterRequest } from "../../model/user/UserRequestModel";

import logo from "../../assets/img/logo.svg";
import appleLogo from "../../assets/img/icons/apple-logo.svg";
import googleLogo from "../../assets/img/icons/google-logo.svg";
import facebookLogo from "../../assets/img/icons/facebook-logo.svg";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const body: IUserRegisterRequest = {
    phone: phone,
    plainPassword: password,
    name: name,
  };

  const handleRegisterSuccess = () => {
    showToast("Đăng ký tài khoản thành công!", "success");
    navigate("/login");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !phone || !password || !confirmPassword || !agree) {
      showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    setIsLoading(true);
    const respond = await UserService.register(body);
    if (respond?.result?.success) {
      handleRegisterSuccess();
    } else if (respond?.code === 400) {
      showToast(respond?.message || "Đăng ký tài khoản thất bại!", "error");
    } else {
      showToast(respond?.message || "Đăng ký tài khoản thất bại!", "error");
    }

    setIsLoading(false);
  };

  return (
    <div className="main-wrapper">
      <div className="overflow-hidden p-3 acc-vh">
        <div className="row vh-100 w-100 g-0">
          <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
            <div className="row">
              <div className="col-md-10 mx-auto">
                <form className="vh-100 d-flex justify-content-between flex-column p-4 pb-0" onSubmit={handleSubmit}>
                  <div className="text-center mb-3 auth-logo">
                    <img src={logo} className="img-fluid" alt="Logo" />
                  </div>
                  <div>
                    <div className="mb-3">
                      <h3 className="mb-2">Đăng ký</h3>
                      <p className="mb-0">Tạo mới tài khoản My Beauty</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="register-name">
                        Họ tên
                      </label>
                      <div className="input-group input-group-flat">
                        <input
                          id="register-name"
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        <span className="input-group-text">
                          <i className="ti ti-user"></i>
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="register-phone">
                        Số điện thoại
                      </label>
                      <div className="input-group input-group-flat">
                        <input
                          id="register-phone"
                          type="tel"
                          className="form-control"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                          required
                          placeholder=""
                          maxLength={10}
                        />
                        <span className="input-group-text">
                          <i className="ti ti-phone"></i>
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label" htmlFor="register-password">
                        Mật khẩu
                      </label>
                      <div className="input-group input-group-flat pass-group">
                        <input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          className="form-control pass-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <span className="input-group-text toggle-password" style={{ cursor: "pointer" }} onClick={() => setShowPassword((v) => !v)}>
                          <i className={`ti ${showPassword ? "ti-eye" : "ti-eye-off"}`}></i>
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="register-confirm-password">
                        Nhập lại mật khẩu
                      </label>
                      <div className="input-group input-group-flat pass-group">
                        <input
                          id="register-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control pass-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <span
                          className="input-group-text toggle-password"
                          style={{ cursor: "pointer" }}
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        >
                          <i className={`ti ${showConfirmPassword ? "ti-eye" : "ti-eye-off"}`}></i>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="form-check form-check-md d-flex align-items-center">
                        <input
                          className="form-check-input mt-0"
                          type="checkbox"
                          id="checkbox-md"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                          required
                        />
                        <label className="form-check-label ms-1" htmlFor="checkbox-md">
                          Tôi đồng ý với{" "}
                          <a href="javascript:void(0);" className="text-primary link-hover">
                            Điều khoản &amp; Quyền riêng tư
                          </a>
                        </label>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                        {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                      </button>
                    </div>
                    <div className="mb-3">
                      <p className="mb-0">
                        Bạn đã có tài khoản?
                        <a href="login" className="link-indigo fw-bold link-hover">
                          {" "}
                          Đăng nhập ngay
                        </a>
                      </p>
                    </div>
                    <div className="or-login text-center position-relative mb-3">
                      <h6 className="fs-14 mb-0 position-relative text-body">HOẶC</h6>
                    </div>
                    <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 mb-3">
                      <div className="text-center flex-fill">
                        <a href="javascript:void(0);" className="p-2 btn btn-info d-flex align-items-center justify-content-center">
                          <img className="img-fluid m-1" src={facebookLogo} alt="Facebook" />
                        </a>
                      </div>
                      <div className="text-center flex-fill">
                        <a href="javascript:void(0);" className="p-2 btn btn-outline-light d-flex align-items-center justify-content-center">
                          <img className="img-fluid m-1" src={googleLogo} alt="Google" />
                        </a>
                      </div>
                      <div className="text-center flex-fill">
                        <a href="javascript:void(0);" className="p-2 btn btn-dark d-flex align-items-center justify-content-center">
                          <img className="img-fluid m-1" src={appleLogo} alt="Apple" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-center pb-4">{/* <p className="text-dark mb-0">Copyright &copy; {new Date().getFullYear()} - CRMS</p> */}</div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-6 account-bg-02"></div>
        </div>
      </div>
    </div>
  );
}
