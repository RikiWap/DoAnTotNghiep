import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useCookies } from "react-cookie";
import { showToast } from "./../../utils/common";
import { useNavigate } from "react-router-dom";
import UserService from "../../services/UserService";
import PermissionService from "../../services/PermissionService";
import type { IUserLoginRequest } from "../../model/user/UserRequestModel";

import logo from "../../assets/img/logo.svg";
import appleLogo from "../../assets/img/icons/apple-logo.svg";
import googleLogo from "../../assets/img/icons/google-logo.svg";
import facebookLogo from "../../assets/img/icons/facebook-logo.svg";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const abortController = useRef<AbortController | null>(null);

  const body: IUserLoginRequest = {
    phone,
    plainPassword: password,
  };

  const handleLoginSuccess = async (token: string) => {
    setCookie("token", token, {
      path: "/",
      maxAge: remember ? 30 * 24 * 60 * 60 : undefined,
    });
    showToast("Đăng nhập thành công!", "success");

    setIsLoading(true);
    abortController.current = new AbortController();

    const response = await PermissionService.resources(token, abortController.current?.signal);
    if (response && Array.isArray(response.result)) {
      const map: Record<string, number> = {};
      response.result.forEach((item: { code?: string; actions?: string | string[] }) => {
        const code = item.code;
        let actions = item.actions;
        if (typeof actions === "string" && actions.trim().startsWith("[") && actions.trim().endsWith("]")) {
          const parsed = JSON.parse(actions);
          if (Array.isArray(parsed)) actions = parsed;
        }
        if (code && Array.isArray(actions)) {
          actions.forEach((act) => {
            const key = `${code}_${act}`;
            map[key] = 1;
          });
        }
      });
      // Lưu vào localStorage
      Object.keys(map).forEach((k) => {
        localStorage.setItem(k, String(map[k]));
      });
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra khi lấy quyền!", "error");
    }
    setIsLoading(false);
    navigate("/lead-reports");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phone || !password) {
      showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    setIsLoading(true);
    const respond = await UserService.login(body);
    if (respond?.result?.token) {
      await handleLoginSuccess(respond.result.token);
    } else if (respond?.code === 400) {
      showToast(respond?.message || "Số điện thoại hoặc mật khẩu không đúng!", "error");
    } else {
      showToast(respond?.message || "Có lỗi xảy ra, vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    return () => abortController.current?.abort();
  }, []);

  return (
    <div className="main-wrapper">
      <div className="overflow-hidden p-3 acc-vh">
        <div className="row vh-100 w-100 g-0">
          <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
            <div className="row">
              <div className="col-md-10 mx-auto">
                <form className="vh-100 d-flex justify-content-between flex-column p-4 pb-0" onSubmit={handleSubmit}>
                  <div className="text-center mb-4 auth-logo">
                    <img src={logo} className="img-fluid" alt="Logo" />
                  </div>
                  <div>
                    <div className="mb-3">
                      <h3 className="mb-2">Đăng nhập</h3>
                      <p className="mb-0">Truy cập hệ thống My Beauty bằng số điện thoại và mật khẩu của bạn.</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="login-phone">
                        Số điện thoại
                      </label>
                      <div className="input-group input-group-flat">
                        <input
                          id="login-phone"
                          type="tel"
                          className="form-control"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                        <span className="input-group-text">
                          <i className="ti ti-phone"></i>
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="login-password">
                        Mật khẩu
                      </label>
                      <div className="input-group input-group-flat pass-group">
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          className="form-control pass-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                        <span className="input-group-text toggle-password" style={{ cursor: "pointer" }} onClick={() => setShowPassword((v) => !v)}>
                          <i className={`ti ${showPassword ? "ti-eye" : "ti-eye-off"}`}></i>
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="form-check form-check-md d-flex align-items-center">
                        <input
                          className="form-check-input mt-0"
                          type="checkbox"
                          id="checkbox-md"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          disabled={isLoading}
                        />
                        <label className="form-check-label text-dark ms-1" htmlFor="checkbox-md">
                          Ghi nhớ đăng nhập
                        </label>
                      </div>
                      <div className="text-end">
                        <a href="forgot-password" className="link-danger fw-medium link-hover">
                          Quên mật khẩu?
                        </a>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                      </button>
                    </div>
                    <div className="mb-3">
                      <p className="mb-0">
                        Mới sử dụng hệ thống của chúng tôi?
                        <a href="register" className="link-indigo fw-bold link-hover">
                          {" "}
                          Tạo tài khoản
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
                  <div className="text-center pb-4">
                    {/* <p className="text-dark mb-0">Copyright &copy; {new Date().getFullYear()} - trnhxbach</p> */}
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-6 account-bg-01"></div>
        </div>
      </div>
    </div>
  );
}
