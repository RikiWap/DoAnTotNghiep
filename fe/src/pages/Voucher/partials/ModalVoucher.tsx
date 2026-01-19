/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from "react";
import type { IVoucherResponse } from "../../../model/voucher/VoucherResponseModel";
import type { IVoucherRequest } from "../../../model/voucher/VoucherRequestModel";
import BranchService from "../../../services/BranchService";
import { getCookie } from "../../../utils/common";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import "./ModalVoucher.scss";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IVoucherResponse;
  onClose: () => void;
  onSubmit: (payload: IVoucherRequest) => void;
  onDelete?: () => void;
};

export default function ModalVoucher({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};
  const token = getCookie("token");
  const [branchOptions, setBranchOptions] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [discountType, setDiscountType] = useState<number>(1);

  useEffect(() => {
    if ((type === "add" || type === "edit") && shown) {
      BranchService.list({ page: 1, limit: 1000 }, token).then((res: any) => {
        if (res && res.code === 200) {
          const allSystemOption = { id: 0, name: "Toàn hệ thống (Mặc định)" };
          setBranchOptions([allSystemOption, ...(res.result.items || [])]);
          // setBranchOptions(res.result.items || []);
        }
      });
    }
  }, [type, shown, token]);

  // useEffect(() => {
  //   if ((type === "edit" || type === "detail") && item) {
  //     setDiscountType(item.discountType || 1);
  //     if (branchOptions.length > 0 && item.branchId) {
  //       const found = branchOptions.find((b) => b.id === item.branchId);
  //       setSelectedBranch(found || null);
  //     } else {
  //       setSelectedBranch(null);
  //     }
  //   } else if (type === "add") {
  //     setDiscountType(1);
  //     setSelectedBranch(null);
  //   }
  // }, [item, type, shown, branchOptions]);

  useEffect(() => {
    if ((type === "edit" || type === "detail") && item) {
      setDiscountType(item.discountType || 1);
      if (branchOptions.length > 0) {
        if (item.branchId) {
          const found = branchOptions.find((b) => b.id === item.branchId);
          setSelectedBranch(found || branchOptions.find((b) => b.id === 0));
        } else {
          setSelectedBranch(branchOptions.find((b) => b.id === 0));
        }
      }
    } else if (type === "add") {
      setDiscountType(1);
      if (branchOptions.length > 0) {
        setSelectedBranch(branchOptions.find((b) => b.id === 0));
      } else {
        setSelectedBranch(null);
      }
    }
  }, [item, type, shown, branchOptions]);

  // if (!type || !shown) return null;
  if (!type) return null;

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
                <h5 className="mb-1">Xóa voucher?</h5>
                <p className="mb-3">Bạn có chắc muốn xóa "{item.name}" không?</p>
                <div className="d-flex justify-content-center">
                  <button type="button" className="btn btn-sm btn-light position-relative z-1 me-2 w-100" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-sm btn-primary position-relative z-1 w-100" onClick={onDelete}>
                    Xóa ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal style={{ zIndex: 1100 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{type === "add" ? "Thêm voucher mới" : type === "edit" ? "Cập nhật voucher" : "Chi tiết voucher"}</h5>
              <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (type === "detail") return;

                const fd = new FormData(e.target as HTMLFormElement);
                const data = Object.fromEntries(fd.entries());

                const payload: IVoucherRequest = {
                  code: String(data.code || ""),
                  name: String(data.name || ""),
                  description: String(data.description || ""),
                  discountType: Number(data.discountType),
                  discountValue: Number(data.discountValue || 0),
                  maxDiscount: Number(data.discountType) === 2 ? Number(data.maxDiscount || 0) : 0,
                  minInvoiceAmount: Number(data.minInvoiceAmount || 0),
                  totalQuantity: Number(data.totalQuantity || 0),
                  perUserLimit: Number(data.perUserLimit || 1),
                  startDate: String(data.startDate),
                  endDate: String(data.endDate),
                  status: Number(data.status || 0),
                  // branchId: selectedBranch?.id || undefined,
                  branchId: selectedBranch?.id && selectedBranch.id !== 0 ? selectedBranch.id : undefined,
                  usageQuantity: Number(data.usageQuantity || 0),
                };

                if (type === "edit" && item?.id) {
                  payload.id = item.id;
                }

                onSubmit(payload);
              }}
            >
              <div className="modal-body row custom-modal-scroll">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Mã voucher <span className="text-danger">*</span>
                    </label>
                    <input
                      name="code"
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="Nhập mã voucher"
                      required
                      defaultValue={item?.code || ""}
                      {...inputProps}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Tên chương trình <span className="text-danger">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên chương trình"
                      required
                      defaultValue={item?.name || ""}
                      {...inputProps}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Loại giảm giá</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="discountType"
                          id="type1"
                          value={1}
                          checked={discountType === 1}
                          onChange={() => setDiscountType(1)}
                          disabled={!!inputProps.disabled}
                        />
                        <label className="form-check-label" htmlFor="type1">
                          Giảm theo tiền (VNĐ)
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="discountType"
                          id="type2"
                          value={2}
                          checked={discountType === 2}
                          onChange={() => setDiscountType(2)}
                          disabled={!!inputProps.disabled}
                        />
                        <label className="form-check-label" htmlFor="type2">
                          Giảm theo %
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className={discountType === 2 ? "col-6 mb-3 pl-0 pr-0" : "col-12 mb-3  pl-0 pr-0"}>
                      <label className="form-label">
                        Giá trị giảm <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          name="discountValue"
                          type="number"
                          className="form-control"
                          required
                          defaultValue={item?.discountValue}
                          min={0}
                          {...inputProps}
                        />
                        <span className="input-group-text">{discountType === 1 ? "VNĐ" : "%"}</span>
                      </div>
                    </div>

                    {discountType === 2 && (
                      <div className="col-6 mb-3">
                        <label className="form-label">Giảm tối đa</label>
                        <div className="input-group">
                          <input name="maxDiscount" type="number" className="form-control" defaultValue={item?.maxDiscount} min={0} {...inputProps} />
                          <span className="input-group-text">VNĐ</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Đơn tối thiểu</label>
                    <div className="input-group">
                      <input
                        name="minInvoiceAmount"
                        type="number"
                        className="form-control"
                        defaultValue={item?.minInvoiceAmount || 0}
                        min={0}
                        {...inputProps}
                      />
                      <span className="input-group-text">VNĐ</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Áp dụng chi nhánh</label>
                    <CustomSelect
                      options={branchOptions}
                      value={selectedBranch}
                      onChange={setSelectedBranch}
                      isDisabled={!!inputProps.disabled}
                      placeholder="Toàn hệ thống (Mặc định)"
                      isClearable={true}
                    />
                  </div>

                  <div className="row">
                    <div className="col-4 mb-3 pl-0">
                      <label className="form-label">Tổng lượt dùng</label>
                      <input
                        name="totalQuantity"
                        type="number"
                        className="form-control"
                        defaultValue={item?.totalQuantity || 100}
                        min={1}
                        {...inputProps}
                      />
                    </div>
                    <div className="col-4 mb-3 pl-0">
                      <label className="form-label">Có thể dùng</label>
                      <input
                        name="usageQuantity"
                        type="number"
                        className="form-control"
                        defaultValue={item?.usageQuantity || 100}
                        min={1}
                        {...inputProps}
                      />
                    </div>
                    <div className="col-4 mb-3 pl-0">
                      <label className="form-label">Giới hạn/Khách</label>
                      <input
                        name="perUserLimit"
                        type="number"
                        className="form-control"
                        defaultValue={item?.perUserLimit || 1}
                        min={1}
                        {...inputProps}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Thời gian bắt đầu <span className="text-danger">*</span>
                    </label>
                    <input
                      name="startDate"
                      type="datetime-local"
                      className="form-control"
                      required
                      defaultValue={item?.startDate ? item.startDate.slice(0, 16) : ""}
                      {...inputProps}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Thời gian kết thúc <span className="text-danger">*</span>
                    </label>
                    <input
                      name="endDate"
                      type="datetime-local"
                      className="form-control"
                      required
                      defaultValue={item?.endDate ? item.endDate.slice(0, 16) : ""}
                      {...inputProps}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <div className="mt-1">
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="active"
                          value={1}
                          defaultChecked={item?.status === 1 || !item}
                          {...inputProps}
                        />
                        <label className="form-check-label" htmlFor="active">
                          Hoạt động
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="inactive"
                          value={0}
                          defaultChecked={item?.status === 0}
                          {...inputProps}
                        />
                        <label className="form-check-label" htmlFor="inactive">
                          Ngưng hoạt động
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Mô tả chi tiết</label>
                  <textarea name="description" className="form-control" rows={3} defaultValue={item?.description || ""} {...inputProps}></textarea>
                </div>
              </div>

              <div className="modal-footer">
                {type === "detail" && (
                  <button type="button" className="btn btn-primary" onClick={onClose}>
                    Đóng
                  </button>
                )}
                {type !== "detail" && (
                  <button type="submit" className="btn btn-primary">
                    {type === "add" ? "Tạo mới" : "Lưu thay đổi"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className={`modal-backdrop fade ${shown ? "show" : ""}`} style={{ zIndex: 1090 }} />
    </Fragment>
  );
}
