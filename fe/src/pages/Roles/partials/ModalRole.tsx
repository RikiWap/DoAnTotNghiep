import { Fragment } from "react";
import type { IRoleItem } from "../../../model/roles/RoleResponseModel";
import type { IRoleUpdateRequest } from "../../../model/roles/RoleRequestModel";

type ModalType = "add" | "edit" | "delete" | "permission" | "detail";
type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IRoleItem;
  onClose: () => void;
  onSubmit: (payload: IRoleUpdateRequest) => void;
  onDelete?: () => void;
};

export default function ModalRole({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  if (!type) return null;

  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};

  if (type === "add") {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm vai trò</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);
                  onSubmit({
                    name: String(fd.get("name") || ""),
                    isDefault: fd.get("isDefault") === "on" ? 1 : 0,
                    isOperator: fd.get("isOperator") === "on" ? 1 : 0,
                  });
                }}
              >
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">
                      Tên vai trò <span className="text-danger">*</span>
                    </label>
                    <input name="name" type="text" className="form-control" required />
                  </div>
                  <div className="mb-2 form-check">
                    <input name="isDefault" type="checkbox" className="form-check-input" id="isDefault" style={{ cursor: "pointer" }} />
                    <label className="form-check-label" htmlFor="isDefault">
                      Quyền mặc định
                    </label>
                  </div>
                  <div className="mb-2 form-check">
                    <input name="isOperator" type="checkbox" className="form-check-input" id="isOperator" style={{ cursor: "pointer" }} />
                    <label className="form-check-label" htmlFor="isOperator">
                      Quyền điều hành (quyền truy cập full API)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex align-items-center justify-content-end m-0">
                    <button type="button" className="btn btn-light me-2" onClick={onClose}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Tạo mới
                    </button>
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

  if ((type === "edit" || type === "detail") && item) {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{type === "edit" ? "Sửa vai trò" : "Chi tiết vai trò"}</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (type === "detail") return;
                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);
                  onSubmit({
                    id: item.id,
                    name: String(fd.get("name") || ""),
                    isDefault: item.isDefault ?? 0,
                    isOperator: item.isOperator ?? 0,
                  });
                }}
              >
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">
                      Tên vai trò <span className="text-danger">*</span>
                    </label>
                    <input name="name" type="text" className="form-control" defaultValue={item.name} required {...inputProps} />
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
                        <button type="submit" className="btn btn-primary">
                          Lưu thay đổi
                        </button>
                      </>
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
                <h5 className="mb-1">Xóa vai trò</h5>
                <p className="mb-3">Bạn có chắc muốn xóa vai trò đã chọn không?</p>
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
