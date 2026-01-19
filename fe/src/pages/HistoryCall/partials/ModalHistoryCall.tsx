/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState } from "react";
import type { ICallHistoryResponse } from "../../../model/historyCall/HistoryCallResponseModel";
import type { ICallHistoryRequest } from "../../../model/historyCall/HistoryCallRequestModel";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import { getCookie, showToast } from "../../../utils/common";
import UserService from "../../../services/UserService";
import CustomerService from "../../../services/CustomerService";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: ICallHistoryResponse;
  onClose: () => void;
  onSubmit: (payload: ICallHistoryRequest) => void;
  onDelete?: () => void;
};

export default function ModalHistoryCall({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const token = getCookie("token");
  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [callType, setCallType] = useState<number>(1);
  const [outcome, setOutcome] = useState<number>(1);
  const [duration, setDuration] = useState<number>(0);
  const [interestLevel, setInterestLevel] = useState<number>(3);
  const [note, setNote] = useState<string>("");
  const [status, setStatus] = useState<number>(1);
  const [userOptions, setUserOptions] = useState<any[]>([]);
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);

  const outcomeOptions = [
    { id: 1, name: "Gọi đến" },
    { id: 2, name: "Gọi đi" },
    { id: 3, name: "Gọi nhỡ" },
  ];
  const selectedOutcome = outcomeOptions.find((opt) => opt.id === outcome);

  useEffect(() => {
    if ((type === "add" || type === "edit") && shown && token) {
      const fetchData = async () => {
        try {
          const [userRes, customerRes] = await Promise.all([
            UserService.list({ page: 1, limit: 1000 }, token),
            CustomerService.list({ page: 1, limit: 1000 }, token),
          ]);

          if (userRes && (userRes.code === 200 || userRes.success)) {
            const users = userRes.result?.items || userRes.data?.items || [];
            setUserOptions(
              users.map((u: any) => ({
                id: u.id,
                name: u.fullname || u.username || u.name || `User ${u.id}`,
              }))
            );
          }

          if (customerRes && (customerRes.code === 200 || customerRes.success)) {
            const customers = customerRes.result?.items || customerRes.data?.items || [];
            setCustomerOptions(
              customers.map((c: any) => ({
                id: c.id,
                name: c.name || `Customer ${c.id}`,
              }))
            );
          }
        } catch (error) {
          console.error("Lỗi tải dữ liệu tùy chọn:", error);
        }
      };
      fetchData();
    }
  }, [type, shown, token]);

  useEffect(() => {
    if ((type === "edit" || type === "detail") && item) {
      const foundUser = userOptions.find((u) => u.id === item.userId);
      setSelectedUser(foundUser || { id: item.userId, name: item.userName || `User #${item.userId}` });

      const foundCustomer = customerOptions.find((c) => c.id === item.customerId);
      setSelectedCustomer(foundCustomer || { id: item.customerId, name: item.customerName || `Customer #${item.customerId}` });

      setCallType(item.callType);
      setOutcome(item.outcome);
      setDuration(item.duration);
      setInterestLevel(item.interestLevel);
      setNote(item.note || "");
      setStatus(item.status);
    } else if (type === "add") {
      setSelectedUser(null);
      setSelectedCustomer(null);
      setCallType(1);
      setOutcome(1);
      setDuration(0);
      setInterestLevel(3);
      setNote("");
      setStatus(1);
    }
  }, [item, type, shown, userOptions, customerOptions]);

  useEffect(() => {
    if (outcome === 3) {
      setDuration(0);
    }
  }, [outcome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "detail") return;

    if (!selectedUser?.id || !selectedCustomer?.id) {
      showToast("Vui lòng chọn nhân viên và khách hàng", "error");
      return;
    }

    const payload: ICallHistoryRequest = {
      userId: selectedUser.id,
      customerId: selectedCustomer.id,
      callType,
      outcome,
      interestLevel: outcome === 3 ? 0 : interestLevel,
      duration: outcome === 3 ? 0 : Number(duration),
      note,
      status,
    };

    if (type === "edit" && item?.id) {
      payload.id = item.id;
    }

    onSubmit(payload);
  };

  if (!type) return null;

  if (type === "delete" && item) {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal style={{ zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
            <div className="modal-content rounded-0 border-radius">
              <div className="modal-body p-4 text-center position-relative">
                <div className="mb-3 position-relative z-1">
                  <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                    <i className="ti ti-trash fs-24"></i>
                  </span>
                </div>
                <h5 className="mb-1">Xóa lịch sử?</h5>
                <p className="mb-3">Bạn có chắc muốn xóa bản ghi này không?</p>
                <div className="d-flex justify-content-center">
                  <button type="button" className="btn btn-sm btn-light position-relative z-1 me-2 w-100" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-sm btn-primary position-relative z-1 w-100" onClick={onDelete}>
                    Đồng ý
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`modal-backdrop fade ${shown ? "show" : ""}`} style={{ zIndex: 1090 }} />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal style={{ zIndex: 1100 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{type === "add" ? "Thêm cuộc gọi" : type === "edit" ? "Cập nhật cuộc gọi" : "Chi tiết cuộc gọi"}</h5>
              <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body row g-3 custom-modal-scroll">
                <div className="col-md-6">
                  <label className="form-label">
                    Nhân viên <span className="text-danger">*</span>
                  </label>
                  <CustomSelect
                    options={userOptions}
                    value={selectedUser}
                    onChange={setSelectedUser}
                    isDisabled={!!inputProps.disabled}
                    placeholder="Chọn nhân viên"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Khách hàng <span className="text-danger">*</span>
                  </label>
                  <CustomSelect
                    options={customerOptions}
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                    isDisabled={!!inputProps.disabled}
                    placeholder="Chọn khách hàng"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Loại cuộc gọi</label>
                  <div className="d-flex gap-4 mt-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="callType"
                        id="typeAudio"
                        value={1}
                        checked={callType === 1}
                        onChange={() => setCallType(1)}
                        disabled={!!inputProps.disabled}
                      />
                      <label className="form-check-label" htmlFor="typeAudio">
                        <i className="ti ti-phone me-1"></i> Audio
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="callType"
                        id="typeVideo"
                        value={2}
                        checked={callType === 2}
                        onChange={() => setCallType(2)}
                        disabled={!!inputProps.disabled}
                      />
                      <label className="form-check-label" htmlFor="typeVideo">
                        <i className="ti ti-video me-1"></i> Video
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Trạng thái</label>
                  <div className="d-flex gap-4 mt-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="status"
                        id="st1"
                        value={1}
                        checked={status === 1}
                        onChange={() => setStatus(1)}
                        disabled={!!inputProps.disabled}
                      />
                      <label className="form-check-label" htmlFor="st1">
                        Đang hoạt động
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="status"
                        id="st0"
                        value={0}
                        checked={status === 0}
                        onChange={() => setStatus(0)}
                        disabled={!!inputProps.disabled}
                      />
                      <label className="form-check-label" htmlFor="st0">
                        Ngưng hoạt động
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Kết quả cuộc gọi</label>
                  <CustomSelect
                    options={outcomeOptions}
                    value={selectedOutcome}
                    onChange={(opt: any) => setOutcome(opt?.id || 1)}
                    isDisabled={!!inputProps.disabled}
                    placeholder="Chọn kết quả"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Thời lượng (giây)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    min={0}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={!!inputProps.disabled || outcome === 3}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label me-3">Mức độ hài lòng:</label>
                  <div className={`d-inline-flex gap-2 align-items-center ${outcome === 3 || !!inputProps.disabled ? "opacity-50 pe-none" : ""}`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`ti ti-star fs-4 cursor-pointer ${interestLevel >= star ? "text-warning" : "text-muted"}`}
                        onClick={() => type !== "detail" && setInterestLevel(star)}
                      ></i>
                    ))}
                    <span className="text-muted ms-2 small">({interestLevel}/5)</span>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Nội dung cuộc gọi"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    {...inputProps}
                  />
                </div>
              </div>

              <div className="modal-footer">
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
                      {type === "add" ? "Tạo mới" : "Lưu thay đổi"}
                    </button>
                  </>
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
