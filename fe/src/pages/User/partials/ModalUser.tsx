import { Fragment, useEffect, useState } from "react";
import type { IUser } from "../../../model/user/UserResponseModel";
import type { IUserUpdateRequest } from "../../../model/user/UserRequestModel";
import BranchService from "../../../services/BranchService";
import { getCookie } from "../../../utils/common";
import type { IBranchResponse } from "../../../model/branch/BranchResponseModel";
import { useAppSelector } from "../../../store";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";

type ModalType = "add" | "edit" | "delete" | "detail";
type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IUser;
  onClose: () => void;
  onSubmit: (payload: IUserUpdateRequest) => void;
  onDelete?: () => void;
};

export default function ModalUser({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};
  const [branchOptions, setBranchOptions] = useState<IBranchResponse[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const token = getCookie("token");
  const userInfo = useAppSelector((state) => state.user.roleId);

  useEffect(() => {
    if (type === "add" || type === "edit") {
      (async () => {
        const res = await BranchService.list({ page: 1, limit: 1000 }, token);
        if (res && res.code === 200 && res.result?.items) {
          setBranchOptions(res.result.items);
        } else {
          setBranchOptions([]);
        }
      })();
    }
  }, [type, shown, token]);

  useEffect(() => {
    if (type === "edit" || type === "detail") {
      setSelectedBranch(item?.branchId ? String(item.branchId) : "");
    } else {
      setSelectedBranch("");
    }
  }, [item, type, shown]);

  if (type === "add" || type === "edit" || type === "detail") {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{type === "add" ? "Thêm người dùng" : type === "edit" ? "Sửa người dùng" : "Chi tiết người dùng"}</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (type === "detail") return;

                  const fd = new FormData(e.target as HTMLFormElement);
                  const data = Object.fromEntries(fd.entries());
                  const payload: IUserUpdateRequest = {
                    name: String(data.name || ""),
                    avatar: String(data.avatar || ""),
                    phone: String(data.phone || ""),
                    email: String(data.email || ""),
                    branchId: selectedBranch ? Number(selectedBranch) : undefined,
                    roleId: userInfo ? Number(userInfo) : undefined,
                    active: data.active ? Number(data.active) : undefined,
                    plainPassword: String(data.plainPassword || ""),
                  };
                  if (type === "edit" && item?.id) {
                    payload.id = item.id;
                  }
                  onSubmit(payload);
                }}
              >
                <div className="modal-body row custom-modal-scroll">
                  <div className="mb-2 col-md-6">
                    <label className="form-label">
                      Tên người dùng <span className="text-danger">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên người dùng"
                      required
                      defaultValue={item?.name || ""}
                      {...inputProps}
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
                      {...inputProps}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="Nhập email liên hệ"
                      defaultValue={item?.email || ""}
                      {...inputProps}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Tên chi nhánh</label>
                    <CustomSelect
                      value={branchOptions.find((branch) => String(branch.id) === selectedBranch) || null}
                      onChange={(option) => setSelectedBranch(option ? String(option.id) : "")}
                      options={branchOptions}
                      isDisabled={inputProps.disabled}
                      placeholder="Chọn chi nhánh"
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      name="plainPassword"
                      type="text"
                      className="form-control"
                      placeholder="Nhập mật khẩu"
                      defaultValue={item?.plainPassword || ""}
                      {...inputProps}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Trạng thái</label>
                    <ul className="list-group list-group-horizontal mt-2">
                      <li className="flex-fill">
                        <input
                          className="form-check-input me-1"
                          type="radio"
                          name="active"
                          id="active1"
                          value={1}
                          defaultChecked={item?.active === 1 || !item?.active}
                        />
                        <label className="form-check-label" htmlFor="active1">
                          Đang hoạt động
                        </label>
                      </li>
                      <li className="flex-fill">
                        <input
                          className="form-check-input me-1"
                          type="radio"
                          name="active"
                          id="active0"
                          value={0}
                          defaultChecked={item?.active === 0}
                        />
                        <label className="form-check-label" htmlFor="active0">
                          Ngưng hoạt động
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex align-items-center justify-content-end m-0">
                    {type === "detail" ? (
                      <button type="button" className="btn btn-primary" onClick={onClose}>
                        Đóng
                      </button>
                    ) : (
                      <>
                        <button type="button" className="btn btn-light me-2" onClick={onClose}>
                          Hủy
                        </button>
                      </>
                    )}
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
                <h5 className="mb-1">Xóa người dùng</h5>
                <p className="mb-3">Bạn có chắc muốn xóa người dùng đã chọn không?</p>
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

  return null;
}
