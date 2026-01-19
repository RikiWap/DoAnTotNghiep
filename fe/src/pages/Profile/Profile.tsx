/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useEffect, useRef, useState } from "react";
import { getCookie } from "../../utils/common";
import { uploadFile } from "../../services/UploadFileService";
import { useAppSelector } from "../../store";
import UserService from "../../services/UserService";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import "./Profile.scss";

export default function Profile({ shown }: { shown?: boolean }) {
  const [avatar, setAvatar] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const token = getCookie("token");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userInfo = useAppSelector((state) => state.user) as any;
  const abortController = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const genderOptions = [
    { id: 1, name: "Nam" },
    { id: 2, name: "Nữ" },
    { id: 0, name: "Khác" },
  ];

  const [form, setForm] = useState({
    name: "",
    avatar: "",
    phone: "",
    email: "",
    gender: 1,
    alias: "",
    subdistrictName: "",
    cityName: "",
  });

  useEffect(() => {
    if (userInfo) {
      setForm((prev) => ({
        ...prev,
        name: userInfo.name || "",
        avatar: userInfo.avatar || prev.avatar,
        phone: userInfo.phone || "",
        email: userInfo.email || "",
        gender: userInfo.gender !== undefined ? userInfo.gender : 1,
        alias: userInfo.alias || "",
        subdistrictName: userInfo.subdistrictName || "",
        cityName: userInfo.cityName || "",
      }));
      setAvatar(userInfo.avatar || "");
    }
    setAvatar((a) => a || form.avatar || "");
    setSuccessMessage("");
  }, [userInfo, shown, token]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const response = await uploadFile(file, token);
      if (response && response.code === 200 && response.result) {
        const uploadedUrl = response.result;
        setAvatar(uploadedUrl);
        setForm((f) => ({ ...f, avatar: uploadedUrl }));
      } else {
        alert("Upload ảnh thất bại. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload ảnh thất bại. Vui lòng thử lại!");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleGenderChange = (option: any) => {
    setForm((f) => ({ ...f, gender: option ? option.id : 1 }));
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    setForm((f) => ({ ...f, avatar: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Không tìm thấy token. Vui lòng đăng nhập lại.");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    abortController.current = new AbortController();

    try {
      const body = {
        ...form,
        gender: Number(form.gender),
      };

      const response = await UserService.updateInfo(body, token);
      if (response && response.code === 200 && response.result) {
        const result = response.result;
        setAvatar(result.avatar || body.avatar || "");
        setForm((f) => ({
          ...f,
          name: result.name ?? f.name,
          phone: result.phone ?? f.phone,
          email: result.email ?? f.email,
          avatar: result.avatar ?? f.avatar,
          gender: result.gender ?? f.gender,
          alias: result.alias ?? f.alias,
          subdistrictName: result.subdistrictName ?? f.subdistrictName,
          cityName: result.cityName ?? f.cityName,
        }));
        setSuccessMessage("Cập nhật thông tin thành công.");
      } else {
        const msg = (response && response.message) || "Cập nhật thông tin thất bại. Vui lòng thử lại!";
        alert(msg);
      }
    } catch (err) {
      console.error("Update info error:", err);
      alert("Cập nhật thông tin thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">Cài đặt chung</h4>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 p-0">
                  <li className="breadcrumb-item">
                    <a href="/">Trang chủ</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Cài đặt chung
                  </li>
                </ol>
              </nav>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <button type="button" className="btn btn-icon btn-outline-light shadow" title="Refresh" onClick={() => window.location.reload()}>
                <i className="ti ti-refresh" />
              </button>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-xl-3 col-lg-12 theiaStickySidebar">
              <div className="card mb-3 mb-xl-0">
                <div className="card-body">
                  <div className="settings-sidebar">
                    <h5 className="mb-3 fs-17">Cài đặt chung</h5>
                    <div className="list-group list-group-flush settings-sidebar">
                      <a href="/profile-settings" className="d-block p-2 fw-medium active">
                        Hồ sơ cá nhân
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-9 col-lg-12">
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-3 pb-3">
                    <h5 className="mb-0 fs-17">Hồ sơ</h5>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <h6 className="mb-1">Ảnh đại diện</h6>
                    </div>

                    <div className="mb-3">
                      <div className="profile-upload d-flex align-items-center">
                        <div className="profile-upload-img avatar avatar-xxl border border-dashed rounded position-relative flex-shrink-0">
                          {avatar ? (
                            <img src={avatar} alt="avatar" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                          ) : (
                            <i className="ti ti-photo text-dark fs-16"></i>
                          )}
                          {avatar && (
                            <button
                              type="button"
                              className="profile-remove btn btn-sm position-absolute"
                              style={{ top: 6, right: 6 }}
                              aria-label="Remove image"
                              onClick={handleRemoveAvatar}
                            >
                              <i className="ti ti-x" />
                            </button>
                          )}
                        </div>

                        <div className="profile-upload-content ms-3">
                          <label
                            className="d-inline-flex align-items-center position-relative btn btn-primary btn-sm mb-2"
                            style={{ cursor: "pointer" }}
                          >
                            <i className="ti ti-file-broken me-1" />
                            Tải ảnh lên
                            <input
                              ref={fileInputRef}
                              name="avatar"
                              type="file"
                              accept="image/*"
                              className="input-img position-absolute w-100 h-100 opacity-0 top-0 start-0"
                              onChange={handleFileChange}
                              disabled={uploading}
                            />
                          </label>
                          <p className="mb-0">JPG, GIF hoặc PNG. Tối đa 5MB</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-bottom mb-3">
                      <h6 className="mb-3">Thông tin chi tiết</h6>
                      <div className="row">
                        {/* Name */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Họ và tên <span className="text-danger">*</span>
                            </label>
                            <input
                              name="name"
                              type="text"
                              className="form-control"
                              value={form.name}
                              onChange={handleChange}
                              placeholder="Nhập họ và tên"
                              required
                            />
                          </div>
                        </div>

                        {/* Alias */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Bí danh / Nickname</label>
                            <input
                              name="alias"
                              type="text"
                              className="form-control"
                              value={form.alias}
                              onChange={handleChange}
                              placeholder="Nhập bí danh"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Số điện thoại <span className="text-danger">*</span>
                            </label>
                            <input
                              name="phone"
                              type="text"
                              className="form-control"
                              value={form.phone}
                              onChange={handleChange}
                              placeholder="Nhập số điện thoại"
                              required
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Email <span className="text-danger">*</span>
                            </label>
                            <input
                              name="email"
                              type="email"
                              className="form-control"
                              value={form.email}
                              onChange={handleChange}
                              placeholder="Nhập email"
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Giới tính</label>
                            <CustomSelect
                              value={genderOptions.find((opt) => opt.id === form.gender)}
                              options={genderOptions}
                              onChange={handleGenderChange}
                              placeholder="Chọn giới tính"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-bottom mb-3">
                      <div className="mb-3">
                        <h6 className="mb-1">Địa chỉ</h6>
                      </div>

                      <div className="row">
                        {/* CityName */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Tỉnh / Thành phố</label>
                            <input
                              name="cityName"
                              type="text"
                              className="form-control"
                              value={form.cityName}
                              onChange={handleChange}
                              placeholder="Nhập tên thành phố"
                            />
                          </div>
                        </div>

                        {/* SubdistrictName */}
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Phường / Xã / Quận</label>
                            <input
                              name="subdistrictName"
                              type="text"
                              className="form-control"
                              value={form.subdistrictName}
                              onChange={handleChange}
                              placeholder="Nhập tên phường/xã"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {successMessage && <div className="alert alert-success">{successMessage}</div>}

                    <div className="d-flex align-items-center justify-content-end flex-wrap gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        onClick={() => window.location.reload()}
                        disabled={isLoading || uploading}
                      >
                        Huỷ
                      </button>
                      <button type="submit" className="btn btn-sm btn-primary" disabled={isLoading || uploading}>
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
