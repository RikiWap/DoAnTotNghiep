import { Fragment } from "react";
import "./ModalResource.scss";
import type { IResourceUpdateRequest } from "../../../model/resources/ResourcesRequestModel";
import type { IResourceItem } from "../../../model/resources/ResourcesResponseModel";

type ModalType = "add" | "edit" | "delete" | "detail";
type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IResourceItem;
  onClose: () => void;
  onSubmit: (payload: IResourceUpdateRequest) => void;
  onDelete?: () => void;
};

export default function ModalResource({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  if (!type) return null;

  let parsedActions: string[] = [];
  if (item?.actions && typeof item.actions === "string") {
    parsedActions = JSON.parse(item.actions);
  } else {
    parsedActions = [];
  }

  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};

  if (type === "add" || type === "edit" || type === "detail") {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{type === "add" ? "Thêm tài nguyên" : type === "edit" ? "Sửa tài nguyên" : "Chi tiết tài nguyên"}</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (type === "detail") return;

                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);

                  const actions: string[] = [];
                  if (fd.get("view")) actions.push("VIEW");
                  if (fd.get("add")) actions.push("ADD");
                  if (fd.get("update")) actions.push("UPDATE");
                  if (fd.get("delete")) actions.push("DELETE");

                  const payload: IResourceUpdateRequest = {
                    name: String(fd.get("name") || ""),
                    description: String(fd.get("description") || ""),
                    code: String(fd.get("code") || ""),
                    uri: String(fd.get("uri") || ""),
                    actions: JSON.stringify(actions),
                  };

                  if (type === "edit" && item?.id) {
                    payload.id = item.id;
                  }

                  onSubmit(payload);
                }}
              >
                <div className="modal-body">
                  <div className="row gx-3">
                    <div className="col-md-6 mb-2">
                      <label className="form-label">
                        Tên tài nguyên <span className="text-danger">*</span>
                      </label>
                      <input
                        name="name"
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên tài nguyên"
                        required
                        defaultValue={item?.name || ""}
                        {...inputProps}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label">
                        Mã tài nguyên <span className="text-danger">*</span>
                      </label>
                      <input
                        name="code"
                        type="text"
                        className="form-control"
                        placeholder="Nhập mã tài nguyên"
                        required
                        defaultValue={item?.code && (typeof item.code === "string" || typeof item.code === "number") ? String(item.code) : ""}
                        {...inputProps}
                      />
                    </div>
                    <div className="col-12 mb-2">
                      <label className="form-label">
                        Đường dẫn <span className="text-danger">*</span>
                      </label>
                      <input
                        name="uri"
                        type="text"
                        className="form-control"
                        placeholder="Nhập đường dẫn"
                        required
                        defaultValue={item?.code && (typeof item.code === "string" || typeof item.uri === "number") ? String(item.uri) : ""}
                        {...inputProps}
                      />
                    </div>
                    <div className="col-12 mb-2">
                      <label className="form-label">Lựa chọn hành động</label>
                      <div className="action-checkboxes d-flex gap-3 flex-wrap mt-2">
                        {["VIEW", "ADD", "UPDATE", "DELETE"].map((action) => (
                          <div className="form-check" key={action}>
                            <input
                              name={action.toLowerCase()}
                              type="checkbox"
                              className="form-check-input"
                              id={`action${action}`}
                              defaultChecked={parsedActions.includes(action)}
                              disabled={type === "detail"}
                              style={{ cursor: "pointer" }}
                            />
                            <label className="form-check-label" htmlFor={`action${action}`}>
                              {action}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-12 mb-2">
                      <label className="form-label">Mô tả</label>
                      <textarea
                        name="description"
                        className="form-control description-textarea"
                        placeholder="Nhập mô tả"
                        defaultValue={
                          item?.description && (typeof item.description === "string" || typeof item.description === "number")
                            ? String(item.description)
                            : ""
                        }
                        {...inputProps}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="d-flex align-items-center justify-content-end m-0">
                    {type !== "detail" && (
                      <button type="button" className="btn btn-light me-2" onClick={onClose}>
                        Hủy
                      </button>
                    )}
                    {type === "detail" && (
                      <button type="button" className="btn btn-primary" onClick={onClose}>
                        Đóng
                      </button>
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
                <h5 className="mb-1">Xóa tài nguyên</h5>
                <p className="mb-3">Bạn có chắc muốn xóa tài nguyên đã chọn không?</p>
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
