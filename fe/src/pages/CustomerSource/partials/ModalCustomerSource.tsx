import { Fragment } from "react";
import "./ModalCustomerSource.scss";
import type { ICustomerSourceResponse } from "../../../model/customerSource/CustomerSourceResponseModel";
import type { ICustomerSourceRequest } from "../../../model/customerSource/CustomerSourceRequestModel";

type ModalType = "add" | "edit" | "delete" | "detail";
type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: ICustomerSourceResponse;
  onClose: () => void;
  onSubmit: (payload: ICustomerSourceRequest) => void;
  onDelete?: () => void;
};

export default function ModalCustomerSource({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  if (!type) return null;

  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};

  if (type === "add") {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm nguồn khách hàng</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);
                  onSubmit({
                    name: String(fd.get("name") || ""),
                    status: Number(fd.get("status") || 1),
                  });
                }}
              >
                <div className="modal-body">
                  <div className="row">
                    <div className="mb-2 col-md-12 pl-0">
                      <label className="form-label">
                        Tên nguồn khách hàng <span className="text-danger">*</span>
                      </label>
                      <input name="name" type="text" className="form-control" placeholder="Nhập nguồn khách hàng" required />
                    </div>
                  </div>
                  <div className="mb-3 col-md-8">
                    <label className="form-label">Trạng thái</label>
                    <div className="mt-2">
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="status1"
                          value={1}
                          defaultChecked={item?.status === 1 || !item?.status}
                          disabled={!!inputProps.disabled}
                        />
                        <label className="form-check-label" htmlFor="status1">
                          Hoạt động
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="status0"
                          value={0}
                          defaultChecked={item?.status === 0}
                          disabled={!!inputProps.disabled}
                        />
                        <label className="form-check-label" htmlFor="status0">
                          Ngưng hoạt động
                        </label>
                      </div>
                    </div>
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
                <h5 className="modal-title">{type === "edit" ? "Sửa nguồn khách hàng" : "Chi tiết nguồn khách hàng"}</h5>
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
                    status: Number(fd.get("status") || item.status),
                  });
                }}
              >
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">
                      Tên nguồn khách hàng <span className="text-danger">*</span>
                    </label>
                    <input name="name" type="text" className="form-control" defaultValue={item.name} required {...inputProps} />
                  </div>
                  <div className="mb-3 col-md-8">
                    <label className="form-label">Trạng thái</label>
                    <div className="mt-2">
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="status1"
                          value={1}
                          defaultChecked={item?.status === 1 || !item?.status}
                          disabled={!!inputProps.disabled}
                        />
                        <label className="form-check-label" htmlFor="status1">
                          Hoạt động
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="status0"
                          value={0}
                          defaultChecked={item?.status === 0}
                          disabled={!!inputProps.disabled}
                        />
                        <label className="form-check-label" htmlFor="status0">
                          Ngưng hoạt động
                        </label>
                      </div>
                    </div>
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
                <h5 className="mb-1">Xóa nguồn khách hàng</h5>
                <p className="mb-3">Bạn có chắc muốn xóa nguồn khách hàng đã chọn không?</p>
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
