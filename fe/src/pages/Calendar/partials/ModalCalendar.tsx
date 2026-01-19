/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useState } from "react";
import type { IScheduleResponse } from "../../../model/schedule/ScheduleResponseModel";
import type { IScheduleRequest } from "../../../model/schedule/ScheduleRequestModel";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import { toVietnamISOString } from "../../../utils/common";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IScheduleResponse;
  initialDate?: { start: string; end: string };
  customerOptions?: Array<{ id?: number | string; name?: string }>;
  userOptions?: Array<{ id?: number | string; name?: string }>;
  onClose: () => void;
  onSubmit: (payload: IScheduleRequest) => void;
  onDelete?: () => void;
  onDeleteClick?: () => void;
};

const toInputDateTime = (isoString?: string) => {
  if (!isoString) return "";
  return isoString.substring(0, 16);
};

const TYPE_OPTIONS = [
  { id: 1, name: "Lịch thực hiện dịch vụ" },
  { id: 2, name: "Lịch tư vấn" },
  { id: 3, name: "Họp nội bộ" },
];

export default function ModalSchedule({
  type,
  shown,
  item,
  initialDate,
  customerOptions = [],
  userOptions = [],
  onClose,
  onSubmit,
  onDelete,
  onDeleteClick,
}: ModalProps) {
  const [scheduleType, setScheduleType] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<any>(TYPE_OPTIONS[0]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // useEffect(() => {
  //   if (shown) {
  //     const typeId = item?.type || 1;
  //     const foundType = TYPE_OPTIONS.find((t) => t.id === typeId) || TYPE_OPTIONS[0];
  //     setSelectedType(foundType);
  //     setScheduleType(typeId);
  //     if (item?.customerId && customerOptions.length > 0) {
  //       const found = customerOptions.find((c) => c.id == item.customerId);
  //       setSelectedCustomer(found || null);
  //     } else {
  //       setSelectedCustomer(null);
  //     }
  //     if (item?.userId && userOptions.length > 0) {
  //       const found = userOptions.find((u) => u.id == item.userId);
  //       setSelectedUser(found || null);
  //     } else {
  //       setSelectedUser(null);
  //     }
  //   }
  // }, [shown, item, customerOptions, userOptions]);
  useEffect(() => {
    if (shown) {
      const typeId = item?.type || 1;
      const foundType = TYPE_OPTIONS.find((t) => t.id === typeId) || TYPE_OPTIONS[0];
      setSelectedType(foundType);
      setScheduleType(typeId);
      if (item?.customerId && customerOptions.length > 0) {
        const found = customerOptions.find((c) => c.id == item.customerId);
        setSelectedCustomer(found || null);
      } else {
        setSelectedCustomer(null);
      }
      if (item?.userId && userOptions.length > 0) {
        const found = userOptions.find((u) => u.id == item.userId);
        setSelectedUser(found || null);
      } else {
        setSelectedUser(null);
      }
      const defaultStart = item?.startTime ? toInputDateTime(item.startTime) : initialDate?.start ? toInputDateTime(initialDate.start) : "";
      const defaultEnd = item?.endTime ? toInputDateTime(item.endTime) : initialDate?.end ? toInputDateTime(initialDate.end) : "";
      setStartTime(defaultStart);
      setEndTime(defaultEnd);
    }
  }, [shown, item, initialDate, customerOptions, userOptions]);

  const handleTypeChange = (opt: any) => {
    setSelectedType(opt);
    setScheduleType(opt?.id || 1);
  };

  if (!type) return null;

  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};
  const isDisabled = type === "detail";

  if (type === "delete" && item) {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
            <div className="modal-content rounded-0 border-radius">
              <div className="modal-body p-4 text-center">
                <div className="mb-3">
                  <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                    <i className="ti ti-trash fs-24"></i>
                  </span>
                </div>
                <h5 className="mb-1">Xóa lịch hẹn</h5>
                <p className="mb-3">
                  Bạn có chắc muốn xóa <b>{item.title}</b> không?
                </p>
                <div className="d-flex justify-content-center">
                  <button type="button" className="btn btn-sm btn-light me-2 w-100" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-sm btn-primary w-100" onClick={onDelete}>
                    Đồng ý
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

  if (type === "add" || type === "edit" || type === "detail") {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{type === "add" ? "Thêm lịch hẹn" : type === "edit" ? "Sửa lịch hẹn" : "Chi tiết lịch hẹn"}</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (type === "detail") return;

                  const fd = new FormData(e.target as HTMLFormElement);

                  const payload: IScheduleRequest = {
                    title: String(fd.get("title") || ""),
                    customerId: scheduleType !== 3 ? selectedCustomer?.id : undefined,
                    userId: scheduleType !== 3 ? selectedUser?.id : undefined,
                    type: selectedType?.id || 1,
                    content: String(fd.get("content") || ""),
                    note: String(fd.get("note") || ""),
                    startTime: toVietnamISOString(startTime),
                    endTime: toVietnamISOString(endTime),
                  };

                  if (type === "edit" && item?.id) {
                    payload.id = item.id;
                  } else {
                    payload.id = 0;
                  }

                  onSubmit(payload);
                }}
              >
                <div className="modal-body">
                  <div className="row gx-3">
                    <div className="col-12 mb-3">
                      <label className="form-label">
                        Tiêu đề <span className="text-danger">*</span>
                      </label>
                      <input name="title" type="text" className="form-control" required defaultValue={item?.title || ""} {...inputProps} />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Loại lịch</label>
                      <CustomSelect
                        options={TYPE_OPTIONS}
                        value={selectedType}
                        onChange={handleTypeChange}
                        isDisabled={isDisabled}
                        placeholder="Chọn loại lịch"
                      />
                    </div>

                    {scheduleType !== 3 && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">
                            Khách hàng <span className="text-danger">*</span>
                          </label>
                          <CustomSelect
                            options={customerOptions}
                            value={selectedCustomer}
                            onChange={setSelectedCustomer}
                            isDisabled={isDisabled}
                            placeholder="Chọn khách hàng..."
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Nhân viên phụ trách</label>
                          <CustomSelect
                            options={userOptions}
                            value={selectedUser}
                            onChange={setSelectedUser}
                            isDisabled={isDisabled}
                            placeholder="Chọn nhân viên..."
                          />
                        </div>
                      </>
                    )}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Bắt đầu <span className="text-danger">*</span>
                      </label>
                      <input
                        name="startTime"
                        type="datetime-local"
                        className="form-control"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        {...inputProps}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Kết thúc <span className="text-danger">*</span>
                      </label>
                      <input
                        name="endTime"
                        type="datetime-local"
                        className="form-control"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        {...inputProps}
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Nội dung</label>
                      <textarea name="content" className="form-control" rows={3} defaultValue={item?.content || ""} {...inputProps} />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Ghi chú</label>
                      <textarea name="note" className="form-control" rows={2} defaultValue={item?.note || ""} {...inputProps} />
                    </div>
                  </div>
                </div>

                <div className="modal-footer d-flex justify-content-between">
                  <div>
                    {type === "edit" && (
                      <button type="button" className="btn btn-danger" onClick={onDeleteClick}>
                        <i className="ti ti-trash me-1"></i> Xóa
                      </button>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-light" onClick={onClose}>
                      Hủy
                    </button>
                    {type !== "detail" && (
                      <button type="submit" className="btn btn-primary">
                        {type === "add" ? "Tạo mới" : "Lưu thay đổi"}
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

  return null;
}
