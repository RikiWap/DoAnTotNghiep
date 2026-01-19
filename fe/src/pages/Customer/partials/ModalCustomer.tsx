/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useRef, useState, useMemo, useEffect } from "react";
import type { ICustomerExtraInfo, ICustomerResponse } from "../../../model/customer/CustomerResponseModel";
import type { ICustomerRequest } from "../../../model/customer/CustomerRequestModel";
import { uploadFile } from "../../../services/UploadFileService";
import { getCookie } from "../../../utils/common";
import DateTimePicker from "../../../components/DateTimePicker/DateTimePicker";
import { useCollapse } from "../../../hooks/useCollapse";
import CustomerAttributeService from "../../../services/CustomerAttributeService";
import CustomerService from "../../../services/CustomerService";
import type { ICustomerAttributeResponse } from "../../../model/customerAttribute/CustomerAttributeResponseModel";
import "./ModalCustomer.scss";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: ICustomerResponse;
  onClose: () => void;
  onSubmit: (payload: ICustomerRequest) => void;
  onDelete?: () => void;
};

type OffcanvasMode = "add" | "edit" | "detail";

type OffcanvasBodyProps = {
  mode: OffcanvasMode;
  shown: boolean;
  readOnly: boolean;
  item?: ICustomerResponse;
  avatar: string;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  birthday: string;
  onBirthdayChange: (iso: string) => void;
  onClose: () => void;
  onSubmit: (payload: ICustomerRequest) => void;
};

function OffcanvasBody({
  mode,
  shown,
  readOnly,
  item,
  avatar,
  uploading,
  fileInputRef,
  onFileChange,
  birthday,
  onBirthdayChange,
  onClose,
  onSubmit,
}: OffcanvasBodyProps) {
  const title = mode === "add" ? "Thêm mới khách hàng" : mode === "edit" ? "Chỉnh sửa khách hàng" : "Chi tiết khách hàng";

  const idPrefix = useMemo(() => {
    if (item && (item as any).id) return `item_${(item as any).id}`;
    return `new_${Date.now()}`;
  }, []);

  const basicId = `${idPrefix}_basic_modal`;
  const addressId = `${idPrefix}_address_modal`;
  const extraInfoId = `${idPrefix}_extra_info_modal`;
  const basic = useCollapse(true);
  const address = useCollapse(false);
  const extraInfo = useCollapse(false);

  const token = getCookie("token");

  // Dynamic attributes state
  const [attributes, setAttributes] = useState<ICustomerAttributeResponse[]>([]);
  const [, setExtraInfos] = useState<ICustomerExtraInfo[]>([]);
  // map attributeId => { id?: number | null, attributeValue: string }
  const [attributeValues, setAttributeValues] = useState<Record<number, { id?: number | null; attributeValue: string }>>({});

  const handleAttributeChange = (attributeId: number, value: string) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attributeId]: {
        id: prev[attributeId]?.id ?? null,
        attributeValue: value,
      },
    }));
  };

  // --- Chèn: Lấy danh sách attribute con khi modal shown
  useEffect(() => {
    if (!shown) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await CustomerAttributeService.listChildren(token, controller.signal);
        if (res && res.code === 200) {
          const items = res.result?.items ?? res.result ?? [];
          setAttributes(items);
          // Khởi tạo attributeValues cho mode add (id=null) nếu chưa có giá trị
          setAttributeValues((prev) => {
            const initMap: Record<number, { id?: number | null; attributeValue: string }> = {};
            items.forEach((a: ICustomerAttributeResponse) => {
              initMap[a.id] = prev[a.id] ?? { id: null, attributeValue: "" };
            });
            return { ...initMap, ...prev };
          });
        }
      } catch (err) {
        // ignore (abort)
      }
    })();
    return () => controller.abort();
  }, [shown, token]);

  // --- Chèn: Nếu là edit thì load giá trị extra của customer và map vào attributeValues
  useEffect(() => {
    if (!shown) return;
    if (mode === "edit" && item?.id) {
      const controller = new AbortController();
      (async () => {
        try {
          const res = await CustomerService.listByCustomer(item.id, token, controller.signal);
          if (res && res.code === 200) {
            const list: ICustomerExtraInfo[] = res.result ?? [];
            setExtraInfos(list);
            setAttributeValues((prev) => {
              const copy = { ...prev };
              list.forEach((ei: ICustomerExtraInfo) => {
                copy[ei.attributeId] = { id: ei.id ?? null, attributeValue: ei.attributeValue ?? "" };
              });
              return copy;
            });
          }
        } catch (err) {
          // ignore
        }
      })();
      return () => controller.abort();
    } else {
      // If not edit, ensure attributeValues has defaults for attributes already loaded
      setAttributeValues((prev) => {
        const copy = { ...prev };
        attributes.forEach((a) => {
          if (!Object.prototype.hasOwnProperty.call(copy, a.id)) {
            copy[a.id] = { id: null, attributeValue: "" };
          }
        });
        return copy;
      });
    }
  }, [shown, mode, item?.id, token, attributes]);

  return (
    <div className={`offcanvas offcanvas-end offcanvas-large ${shown ? " show" : ""}`} tabIndex={-1} style={{ visibility: "visible" }}>
      <div className="offcanvas-header border-bottom">
        <h5 className="mb-0">{title}</h5>
        <button
          type="button"
          className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
          onClick={onClose}
        ></button>
      </div>

      <div className="offcanvas-body">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.target as HTMLFormElement);
            const data = Object.fromEntries(fd.entries());

            const payload: ICustomerRequest = {
              ...data,
              name: String(data.name || ""),
              avatar,
              age: Number(data.age),
              height: Number(data.height),
              weight: Number(data.weight),
              address: String(data.address || ""),
              note: String(data.note || ""),
              phone: String(data.phone || ""),
              email: String(data.email || ""),
              gender: data.gender ? Number(data.gender) : 1,
            };
            if (mode === "edit" && item?.id) {
              payload.id = item.id;
            }

            // Build customerExtraInfos từ attributeValues
            const customerExtraInfos = Object.keys(attributeValues).map((k) => {
              const attrId = Number(k);
              const v = attributeValues[attrId] ?? { id: null, attributeValue: "" };
              const base: any = {
                attributeId: attrId,
                attributeValue: v.attributeValue ?? "",
              };
              if (mode === "edit" && item?.id) base.customerId = item.id;
              base.id = v.id !== undefined ? v.id : null;
              return base;
            });

            if (customerExtraInfos.length > 0) {
              (payload as any).customerExtraInfos = customerExtraInfos;
            }

            onSubmit(payload);
          }}
        >
          <div className="accordion accordion-bordered" id="main_accordion_modal">
            {/* ... Phần Basic Info ... */}
            <div className="accordion-item rounded mb-3">
              <div className="accordion-header">
                <button
                  type="button"
                  className={`accordion-button accordion-custom-button rounded ${basic.isOpen ? "" : "collapsed"}`}
                  aria-expanded={!!basic.isOpen}
                  aria-controls={basicId}
                  onClick={() => basic.toggle()}
                >
                  <span className="avatar avatar-md rounded me-1">
                    <i className="ti ti-user-plus"></i>
                  </span>
                  Thông tin cơ bản
                </button>
              </div>
              <div id={basicId} ref={basic.ref} className={`accordion-collapse collapse ${basic.isOpen ? "show" : ""}`}>
                <div className="accordion-body border-top">
                  <div className="row">
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
                              onChange={onFileChange}
                              disabled={uploading}
                            />
                          </div>
                          <span style={{ fontSize: 14 }}>JPG, GIF hoặc PNG. Tối đa 800Kb</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Họ tên <span className="text-danger">*</span>
                      </label>
                      <input name="name" type="text" className="form-control" placeholder="Nhập họ tên" required defaultValue={item?.name || ""} />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tuổi</label>
                      <input name="age" type="number" className="form-control" placeholder="Nhập số tuổi" defaultValue={item?.age || ""} />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Chiều cao</label>
                      <div className="input-group">
                        <input
                          name="height"
                          type="number"
                          placeholder="Nhập chiều cao"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]+"
                          className="form-control"
                          defaultValue={item?.height || ""}
                        />
                        <span className="input-group-text">cm</span>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ngày sinh</label>
                      <DateTimePicker
                        className="timepicker-input w-100"
                        value={birthday}
                        onChange={onBirthdayChange}
                        readOnly={readOnly}
                        placeholder="Chọn ngày sinh"
                        name="birthday"
                        maxDate={new Date()}
                      />
                    </div>

                    <div className="mb-2 col-md-6">
                      <label className="form-label">Giới tính</label>
                      <ul className="list-group list-group-horizontal mt-2 gap-4">
                        <li className="">
                          <input
                            className="form-check-input me-1"
                            type="radio"
                            name="gender"
                            id="gender2"
                            value={2}
                            defaultChecked={item?.gender === 2 || !item?.gender}
                          />
                          <label className="form-check-label" htmlFor="gender2">
                            Nam
                          </label>
                        </li>
                        <li className="">
                          <input
                            className="form-check-input me-1"
                            type="radio"
                            name="gender"
                            id="gender1"
                            value={1}
                            defaultChecked={item?.gender === 1}
                          />
                          <label className="form-check-label" htmlFor="gender1">
                            Nữ
                          </label>
                        </li>
                      </ul>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Cân nặng</label>
                      <div className="input-group">
                        <input
                          name="weight"
                          type="number"
                          placeholder="Nhập cân nặng"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]+"
                          className="form-control"
                          defaultValue={item?.weight || ""}
                        />
                        <span className="input-group-text">kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ... Phần Address Info ... */}
            <div className="accordion-item border-top rounded mb-3">
              <div className="accordion-header">
                <button
                  type="button"
                  className={`accordion-button accordion-custom-button ${address.isOpen ? "" : "collapsed"} rounded`}
                  aria-expanded={!!address.isOpen}
                  aria-controls={addressId}
                  onClick={() => address.toggle()}
                >
                  <span className="avatar avatar-md rounded me-1">
                    <i className="ti ti-map-pin-cog"></i>
                  </span>
                  Thông tin địa chỉ
                </button>
              </div>

              <div id={addressId} ref={address.ref} className={`accordion-collapse collapse ${address.isOpen ? "show" : ""}`}>
                <div className="accordion-body border-top">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Địa chỉ</label>
                      <input name="address" type="text" className="form-control" placeholder="Nhập địa chỉ" defaultValue={item?.address || ""} />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Số điện thoại</label>
                      <input name="phone" type="tel" className="form-control" placeholder="Nhập số điện thoại" defaultValue={item?.phone || ""} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input name="email" type="text" className="form-control" placeholder="Nhập email liên hệ" defaultValue={item?.email || ""} />
                    </div>
                    <div className="col-md-12 mb-0">
                      <label className="form-label">Ghi chú</label>
                      <textarea rows={3} name="note" className="form-control" placeholder="Nhập ghi chú" defaultValue={item?.note || ""}></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic attributes section */}
            {attributes.length > 0 && (
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <button
                    type="button"
                    className={`accordion-button accordion-custom-button ${extraInfo.isOpen ? "" : "collapsed"} rounded`}
                    aria-expanded={!!extraInfo.isOpen}
                    aria-controls={extraInfoId}
                    onClick={() => extraInfo.toggle()}
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-list"></i>
                    </span>
                    Thông tin bổ sung
                  </button>
                </div>

                <div id={extraInfoId} ref={extraInfo.ref} className={`accordion-collapse collapse ${extraInfo.isOpen ? "show" : ""}`}>
                  <div className="accordion-body border-top">
                    <div className="row">
                      {attributes.map((attr) => {
                        const val = attributeValues[attr.id]?.attributeValue ?? "";
                        const attrJson = (() => {
                          try {
                            return attr.attributes ? JSON.parse(attr.attributes) : null;
                          } catch {
                            return null;
                          }
                        })();

                        return (
                          <div className="col-md-12 mb-3" key={attr.id}>
                            <label className="form-label">{attr.name}</label>

                            {/* TEXT */}
                            {attr.datatype === "text" && (
                              <input
                                type="text"
                                className="form-control"
                                value={val}
                                placeholder={`Nhập ${attr.name}`}
                                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                readOnly={readOnly || !!attr.readonly}
                              />
                            )}

                            {/* TEXTAREA */}
                            {attr.datatype === "textarea" && (
                              <textarea
                                className="form-control"
                                rows={3}
                                value={val}
                                placeholder={`Nhập ${attr.name}`}
                                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                readOnly={readOnly || !!attr.readonly}
                              />
                            )}

                            {/* NUMBER */}
                            {attr.datatype === "number" && (
                              <input
                                type="number"
                                className="form-control"
                                value={val}
                                placeholder="Nhập số"
                                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                readOnly={readOnly || !!attr.readonly}
                              />
                            )}

                            {/* DROPDOWN */}
                            {(attr.datatype === "dropdown" || attr.datatype === "select") && Array.isArray(attrJson) && (
                              <select
                                className="form-select"
                                value={val}
                                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                disabled={readOnly || !!attr.readonly}
                              >
                                <option value="">-- Chọn --</option>
                                {attrJson.map((o: any, idx: number) => (
                                  <option key={idx} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            {/* MULTISELECT */}
                            {attr.datatype === "multiselect" && Array.isArray(attrJson) && (
                              <select
                                className="form-select"
                                multiple
                                value={val ? val.split(",") : []}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    attr.id,
                                    Array.from(e.target.selectedOptions)
                                      .map((o) => o.value)
                                      .join(",")
                                  )
                                }
                                disabled={readOnly || !!attr.readonly}
                              >
                                {attrJson.map((o: any, idx: number) => (
                                  <option key={idx} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            )}

                            {/* RADIO */}
                            {attr.datatype === "radio" && Array.isArray(attrJson) && (
                              <div className="d-flex gap-3">
                                {attrJson.map((o: any, idx: number) => (
                                  <label key={idx} className="d-flex align-items-center gap-1">
                                    <input
                                      type="radio"
                                      checked={val === o.value}
                                      value={o.value}
                                      onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                                      disabled={readOnly || !!attr.readonly}
                                    />
                                    {o.label}
                                  </label>
                                ))}
                              </div>
                            )}

                            {/* CHECKBOX */}
                            {attr.datatype === "checkbox" && (
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={val === "1"}
                                  onChange={(e) => handleAttributeChange(attr.id, e.target.checked ? "1" : "0")}
                                  disabled={readOnly || !!attr.readonly}
                                />
                              </div>
                            )}

                            {/* DATE */}
                            {attr.datatype === "date" && (
                              <DateTimePicker
                                className="timepicker-input w-100"
                                value={val}
                                placeholder="Chọn ngày"
                                onChange={(iso) => handleAttributeChange(attr.id, iso)}
                                readOnly={readOnly || !!attr.readonly}
                              />
                            )}

                            {/* FORMULA (readonly) */}
                            {attr.datatype === "formula" && <input type="text" className="form-control bg-light" value={val} readOnly />}

                            {/* ATTACHMENT */}
                            {attr.datatype === "attachment" && (
                              <div>
                                <input
                                  type="file"
                                  className="form-control"
                                  disabled={readOnly || !!attr.readonly}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const response = await uploadFile(file, getCookie("token"));
                                    if (response?.code === 200) {
                                      handleAttributeChange(attr.id, response.result);
                                    }
                                  }}
                                />
                                {val && (
                                  <a href={val} target="_blank" rel="noreferrer">
                                    Tệp đã tải lên
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SỬA CHỖ NÀY: Bỏ điều kiện !readOnly bọc ngoài, để div này luôn hiển thị */}
          <div className="mt-3 d-flex justify-content-end gap-2">
            <button className="btn btn-light" type="button" onClick={onClose}>
              {readOnly ? "Đóng" : "Huỷ"}
            </button>

            {!readOnly && (
              <button className="btn btn-primary" type="submit">
                {mode === "add" ? "Tạo mới" : "Lưu thay đổi"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

type DeleteModalProps = {
  shown: boolean;
  onClose: () => void;
  onDelete?: () => void;
};

function DeleteModal({ shown, onClose, onDelete }: DeleteModalProps) {
  return (
    <Fragment>
      <div className={`modal fade ${shown ? "show" : ""}`} id="delete_contact" role="dialog" style={{ display: shown ? "block" : "none" }}>
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24"></i>
                </span>
              </div>
              <h5 className="mb-1">Xoá khách hàng</h5>
              <p className="mb-3">Bạn có chắc chắn muốn xoá khách hàng đã chọn?</p>
              <div className="d-flex justify-content-center">
                <button className="btn btn-light position-relative z-1 me-2 w-100" onClick={onClose}>
                  Huỷ
                </button>
                <button
                  className="btn btn-primary position-relative z-1 w-100"
                  onClick={() => {
                    if (typeof onDelete === "function") onDelete();
                    onClose();
                  }}
                >
                  Có, xoá
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {shown && <div className="modal-backdrop fade show" onClick={onClose}></div>}
    </Fragment>
  );
}

export default function ModalCustomer({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string>(item?.avatar || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const token = getCookie("token");
  const [birthday, setBirthday] = useState<string>(item?.birthday || "");

  useEffect(() => {
    setBirthday(item?.birthday || "");
  }, [item]);

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

  if (!type) return null;

  const readOnly = type === "detail";

  return (
    <Fragment>
      {type !== "delete" && (
        <OffcanvasBody
          mode={(type as OffcanvasMode) === "add" ? "add" : (type as OffcanvasMode) === "edit" ? "edit" : "detail"}
          shown={shown}
          readOnly={readOnly}
          item={item}
          avatar={avatar}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          birthday={birthday}
          onBirthdayChange={(iso) => setBirthday(iso)}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}

      {type === "delete" && <DeleteModal shown={shown} onClose={onClose} onDelete={onDelete} />}

      {type !== "delete" && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
    </Fragment>
  );
}
