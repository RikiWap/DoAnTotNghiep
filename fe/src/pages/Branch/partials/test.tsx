/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useRef, useState } from "react";
import type { IBranchResponse } from "../../../model/branch/BranchResponseModel";
import type { IBranchRequest } from "../../../model/branch/BranchRequestModel";
import { getCookie } from "../../../utils/common";
import { uploadFile } from "../../../services/UploadFileService";
import BranchService from "../../../services/BranchService";
import UserService from "../../../services/UserService";
import "./ModalBranch.scss";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";

type ModalType = "add" | "edit" | "delete" | "detail";
type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IBranchResponse;
  onClose: () => void;
  onSubmit: (payload: IBranchRequest) => void;
  onDelete?: () => void;
};

export default function ModalBranch({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string>(item?.avatar || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const token = getCookie("token");
  const [parentOptions, setParentOptions] = useState<IBranchResponse[]>([]);
  const [userOptions, setUserOptions] = useState<Array<{ id?: number | string; name?: string }>>([]);
  const [selectedParent, setSelectedParent] = useState<IBranchResponse | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<{ id?: number | string; name?: string } | null>(null);

  useEffect(() => {
    if (type === "add" || type === "edit") {
      (async () => {
        const res = await BranchService.list({ page: 1, limit: 1000 }, token);
        if (res && res.code === 200 && res.result?.items) {
          setParentOptions(res.result.items);
        } else {
          setParentOptions([]);
        }
      })();

      (async () => {
        const res = await UserService.list({ page: 1, limit: 1000 }, token);
        if (res && res.code === 200 && res.result?.items) {
          setUserOptions(res.result.items);
        } else {
          setUserOptions([]);
        }
      })();

      setAvatar(item?.avatar || "");
    }
  }, [type, shown, token]);

  useEffect(() => {
    const parentSelect = item ? (parentOptions.find((p) => p.id === item.parentId) ?? null) : null;
    const ownerSelect = item ? (userOptions.find((u) => u.id === item.ownerId) ?? null) : null;

    setSelectedParent(parentSelect);
    setSelectedOwner(ownerSelect);
  }, [item, parentOptions, userOptions]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    const response = await uploadFile(file, token);
    if (response && response.code === 200 && response.result) {
      setAvatar(response.result);
    } else {
      alert("Upload ảnh thất bại. Vui lòng thử lại!");
    }
    setUploading(false);
  };

  if (type === "add" || type === "edit") {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{type === "add" ? "Thêm chi nhánh" : "Sửa chi nhánh"}</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as HTMLFormElement);
                  const data = Object.fromEntries(fd.entries());
                  const payload: IBranchRequest = {
                    ...data,
                    name: String(data.name || ""),
                    parentId: data.parentId ? Number(data.parentId) : undefined,
                    avatar,
                    address: String(data.address || ""),
                    website: String(data.website || ""),
                    description: String(data.description || ""),
                    foundingYear: data.foundingYear ? Number(data.foundingYear) : undefined,
                    foundingMonth: data.foundingMonth ? Number(data.foundingMonth) : undefined,
                    foundingDay: data.foundingDay ? Number(data.foundingDay) : undefined,
                    phone: String(data.phone || ""),
                    email: String(data.email || ""),
                    ownerId: data.ownerId ? Number(data.ownerId) : undefined,
                    status: data.status ? Number(data.status) : 1,
                  };
                  if (type === "edit" && item?.id) {
                    payload.id = item.id;
                  }
                  onSubmit(payload);
                }}
              >
                <div className="modal-body row">
                  <div className="col-md-12">
                    <label className="form-label">Ảnh đại diện</label>
                    <div className="d-flex align-items-center mb-3">
                      <div className="avatar avatar-xxl border border-dashed me-3 flex-shrink-0">
                        <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                          {avatar ? (
                            <img src={avatar} alt="avatar" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                          ) : (
                            <i className="ti ti-photo text-dark fs-16"></i>
                          )}
                        </div>
                      </div>
                      <div className="d-inline-flex flex-column align-items-start">
                        <div className="drag-upload-btn btn btn-sm btn-primary position-relative mb-2">
                          <i className="ti ti-file-broken me-1"></i>Tải ảnh lên
                          <input
                            ref={fileInputRef}
                            name="avatar"
                            type="file"
                            className="form-control image-sign"
                            style={{ position: "absolute", left: 0, top: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
                            multiple={false}
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                          />
                        </div>
                        <span style={{ fontSize: 14 }}>JPG, GIF hoặc PNG. Tối đa 800Kb</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 col-12">
                    <label className="form-label">
                      Tên chi nhánh <span className="text-danger">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên chi nhánh"
                      required
                      defaultValue={item?.name || ""}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">
                      Địa chỉ <span className="text-danger">*</span>
                    </label>
                    <input
                      name="address"
                      type="text"
                      className="form-control"
                      placeholder="Nhập địa chỉ"
                      required
                      defaultValue={item?.address || ""}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      name="phone"
                      type="text"
                      className="form-control"
                      placeholder="Nhập số điện thoại"
                      required
                      defaultValue={item?.phone || ""}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">
                      Email liên hệ <span className="text-danger">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="Nhập email liên hệ"
                      required
                      defaultValue={item?.email || ""}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Website</label>
                    <input
                      name="website"
                      type="text"
                      className="form-control"
                      placeholder="Nhập địa chỉ website"
                      defaultValue={item?.website || ""}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Ngày thành lập</label>
                    <input
                      name="foundingDay"
                      type="number"
                      className="form-control"
                      placeholder="Nhập ngày thành lập"
                      min={1}
                      max={31}
                      defaultValue={item?.foundingDay != null ? String(item.foundingDay) : ""}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Tháng thành lập</label>
                    <input
                      name="foundingMonth"
                      type="number"
                      className="form-control"
                      placeholder="Nhập tháng thành lập"
                      min={1}
                      max={12}
                      defaultValue={item?.foundingMonth != null ? String(item.foundingMonth) : ""}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Năm thành lập</label>
                    <input
                      name="foundingYear"
                      type="number"
                      className="form-control"
                      placeholder="Nhập năm thành lập"
                      defaultValue={item?.foundingYear != null ? String(item.foundingYear) : ""}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Người phụ trách</label>
                    <CustomSelect
                      value={selectedOwner}
                      options={userOptions}
                      onChange={(option: any) => setSelectedOwner(option)}
                      placeholder="Chọn người phụ trách"
                      isDisabled={userOptions.length === 0}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Chi nhánh cha</label>
                    <CustomSelect
                      value={selectedParent}
                      options={parentOptions}
                      onChange={(option: any) => setSelectedParent(option)}
                      placeholder="Chọn chi nhánh cha"
                      isDisabled={parentOptions.length === 0}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Trạng thái</label>
                    <ul className="list-group list-group-horizontal mt-2">
                      <li className="flex-fill">
                        <input
                          className="form-check-input me-1"
                          type="radio"
                          name="status"
                          id="active1"
                          value={1}
                          defaultChecked={item?.status === 1 || !item?.status}
                        />
                        <label className="form-check-label" htmlFor="active1">
                          Đang hoạt động
                        </label>
                      </li>
                      <li className="flex-fill">
                        <input
                          className="form-check-input me-1"
                          type="radio"
                          name="status"
                          id="active0"
                          value={0}
                          defaultChecked={item?.status === 0}
                        />
                        <label className="form-check-label" htmlFor="active0">
                          Ngưng hoạt động
                        </label>
                      </li>
                    </ul>
                  </div>
                  <div className="mb-2 col-12">
                    <label className="form-label">Mô tả ngắn</label>
                    {/* <input name="description" type="text" className="form-control" defaultValue={item?.description || ""} /> */}
                    <textarea name="description" className="form-control" placeholder="Nhập mô tả" rows={3} defaultValue={item?.description || ""} />
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex align-items-center justify-content-end m-0">
                    <button type="button" className="btn btn-light me-2" onClick={onClose}>
                      Hủy
                    </button>
                    {type === "add" && (
                      <button type="submit" className="btn btn-primary">
                        Tạo mới
                      </button>
                    )}
                    {type === "edit" && (
                      <button type="submit" className="btn btn-primary">
                        Lưu thay đổi
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className={`modal-backdrop fade ${shown ? "show" : ""}`} />
      </Fragment>
    );
  }

  if (type === "delete" && item) {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
            <div className="modal-content rounded-0 border-radius">
              <div className="modal-body p-4 text-center position-relative">
                <div className="mb-3 position-relative z-1">
                  <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                    <i className="ti ti-trash fs-24"></i>
                  </span>
                </div>
                <h5 className="mb-1">Xóa chi nhánh</h5>
                <p className="mb-3">Bạn có chắc muốn xóa chi nhánh đã chọn không?</p>
                <div className="d-flex justify-content-center">
                  <button type="button" className="btn btn-sm btn-light position-relative z-1 me-2 w-100" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-sm btn-primary position-relative z-1 w-100" onClick={onDelete}>
                    Đồng ý, xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`modal-backdrop fade ${shown ? "show" : ""}`} />
      </Fragment>
    );
  }

  if (type == "detail" && item) {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-none"}`} aria-modal="true" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết chi nhánh</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>

              <div className="modal-body">
                <div className="text-center mb-4">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="rounded-circle shadow-sm border border-2 border-light"
                      style={{ width: 120, height: 120, objectFit: "cover" }}
                    />
                  ) : (
                    <div className="avatar-placeholder bg-light text-muted d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm">
                      No Avatar
                    </div>
                  )}
                  <h6 className="mt-3 fw-bold">{item.name}</h6>
                </div>

                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    <strong>Chi nhánh cha:</strong> {parentOptions?.find((b) => b.id === item.parentId)?.name || "-"}
                  </li>
                  <li className="list-group-item">
                    <strong>Địa chỉ:</strong> {item.address || "-"}
                  </li>
                  <li className="list-group-item">
                    <strong>Website:</strong> {item.website || "-"}
                  </li>
                  <li className="list-group-item">
                    <strong>Mô tả:</strong> {item.description || "-"}
                  </li>
                  <li className="list-group-item">
                    <strong>Ngày thành lập:</strong>{" "}
                    {item.foundingDay && item.foundingMonth && item.foundingYear
                      ? `${item.foundingDay}/${item.foundingMonth}/${item.foundingYear}`
                      : "-"}
                  </li>
                  <li className="list-group-item">
                    <strong>SĐT:</strong> {item.phone || "-"}
                  </li>
                  <li className="list-group-item">
                    <strong>Email:</strong> {item.email || "-"}
                  </li>
                  <li className="list-group-item">
                    <strong>Người phụ trách:</strong> {userOptions?.find((u) => u.id === item.ownerId)?.name || "-"}
                  </li>
                  <li className="list-group-item">
                    <strong>Trạng thái:</strong>{" "}
                    {item.status === 1 ? (
                      <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">Hoạt động</span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">Ngưng hoạt động</span>
                    )}
                  </li>
                  <li className="list-group-item">
                    <strong>Ngày tạo:</strong> {item.createdTime ? new Date(item.createdTime).toLocaleDateString() : "-"}
                  </li>
                </ul>
              </div>
              <div className="modal-footer">
                <div className="d-flex align-items-center justify-content-end m-0">
                  <button type="button" className="btn btn-light me-2" onClick={onClose}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`modal-backdrop fade ${shown ? "show" : ""}`} />
      </Fragment>
    );
  }

  return null;
}
