/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useState } from "react";
import type { ICustomerAttributeResponse } from "../../../model/customerAttribute/CustomerAttributeResponseModel";
import type { ICustomerAttributeRequest } from "../../../model/customerAttribute/CustomerAttributeRequestModel";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import { getCookie } from "../../../utils/common";
import CustomerAttributeService from "../../../services/CustomerAttributeService";

type ModalType = "add" | "edit" | "delete" | "detail";
type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: ICustomerAttributeResponse;
  onClose: () => void;
  onSubmit: (payload: ICustomerAttributeRequest) => void;
  onDelete?: () => void;
};
type DropdownOption = { value: string; label: string };

export default function ModalCustomerSetting({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const isDetail = type === "detail";
  const inputProps = isDetail ? { disabled: true, readOnly: true } : {};
  const [datatype, setDatatype] = useState<string>("number");
  const [required, setRequired] = useState<"0" | "1">("0");
  const [readonly, setReadonly] = useState<"0" | "1">("0");
  const [uniqued, setUniqued] = useState<"0" | "1">("0");
  const [numberFormat, setNumberFormat] = useState<string>("");
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([{ value: "", label: "" }]);
  const [attributesText, setAttributesText] = useState<string>("");
  const [detailLookup, setDetailLookup] = useState<string>("contract");
  const [selectedFormula, setSelectedFormula] = useState<string>("");
  const [parentOptions, setParentOptions] = useState<ICustomerAttributeResponse[]>([]);
  const [selectedParent, setSelectedParent] = useState<ICustomerAttributeResponse | null>(null);
  const [isloading, setIsLoading] = useState<boolean>(false);
  const token = getCookie("token");

  // const listLookup: DropdownOption[] = [
  //   { value: "customer", label: "Khách hàng" },
  //   { value: "employee", label: "Nhân viên" },
  //   { value: "contact", label: "Liên hệ" },
  //   { value: "contract", label: "Hợp đồng" },
  // ];

  const numberFormatPresets = ["1,234", "1,234.5", "1,234.56", "1,234.567"];

  const datatypeOptions: Array<{ id: string; name: string }> = [
    { id: "text", name: "text" },
    { id: "textarea", name: "textarea" },
    { id: "number", name: "number" },
    { id: "dropdown", name: "dropdown" },
    { id: "multiselect", name: "multiselect" },
    { id: "checkbox", name: "checkbox" },
    { id: "radio", name: "radio" },
    { id: "date", name: "date" },
    // { id: "lookup", name: "lookup" },
    { id: "formula", name: "formula" },
    { id: "attachment", name: "attachment" },
  ];

  useEffect(() => {
    if (type === "add" || type === "edit") {
      (async () => {
        setIsLoading(true);
        const res = await CustomerAttributeService.list({ page: 1, limit: 1000 }, token);
        if (res && res.code === 200 && res.result?.items) {
          setParentOptions(res.result.items);
        } else {
          setParentOptions([]);
        }
        setIsLoading(false);
      })();
    }
  }, [type, shown, token]);

  useEffect(() => {
    if (type === "add") {
      setDatatype("");
      setNumberFormat("");
      setDropdownOptions([{ value: "", label: "" }]);
      setAttributesText("");
      setDetailLookup("contract");
      setSelectedFormula("");
      setRequired("0");
      setReadonly("0");
      setUniqued("0");
      setSelectedParent(null);
      return;
    }

    if ((type === "edit" || type === "detail") && item) {
      const dt = String(item.datatype || "").toLowerCase();
      setDatatype(dt || "number");

      setRequired(typeof item.required === "number" ? (item.required > 0 ? "1" : "0") : "0");
      setReadonly(typeof item.readonly === "number" ? (item.readonly > 0 ? "1" : "0") : "0");
      setUniqued(typeof item.uniqued === "number" ? (item.uniqued > 0 ? "1" : "0") : "0");

      const attrStr = item.attributes || "";

      if (dt === "number") {
        try {
          const obj = attrStr ? JSON.parse(attrStr as any) : {};
          setNumberFormat(obj?.numberFormat ? String(obj.numberFormat) : "");
        } catch {
          setNumberFormat("");
        }
        setDropdownOptions([{ value: "", label: "" }]);
        setAttributesText("");
        setDetailLookup("contract");
        setSelectedFormula("");
      } else if (dt === "dropdown" || dt === "radio" || dt === "multiselect") {
        try {
          const arr = attrStr ? JSON.parse(attrStr as any) : [];
          if (Array.isArray(arr) && arr.length) {
            setDropdownOptions(
              arr.map((o: any) => ({
                value: String(o?.value ?? ""),
                label: String(o?.label ?? ""),
              }))
            );
          } else {
            setDropdownOptions([{ value: "", label: "" }]);
          }
        } catch {
          setDropdownOptions([{ value: "", label: "" }]);
        }
        setNumberFormat("");
        setAttributesText("");
        setDetailLookup("contract");
        setSelectedFormula("");
      } else if (dt === "lookup") {
        try {
          const obj = attrStr ? JSON.parse(attrStr as any) : {};
          setDetailLookup(obj?.refType ? String(obj.refType) : "contract");
        } catch {
          setDetailLookup("contract");
        }
        setNumberFormat("");
        setDropdownOptions([{ value: "", label: "" }]);
        setAttributesText("");
        setSelectedFormula("");
      } else if (dt === "formula") {
        try {
          const obj = attrStr ? JSON.parse(attrStr as any) : {};
          setSelectedFormula(obj?.formula ? String(obj.formula) : "");
        } catch {
          setSelectedFormula("");
        }
        setNumberFormat("");
        setDropdownOptions([{ value: "", label: "" }]);
        setAttributesText("");
        setDetailLookup("contract");
      } else {
        setAttributesText(attrStr || "");
        setNumberFormat("");
        setDropdownOptions([{ value: "", label: "" }]);
        setDetailLookup("contract");
        setSelectedFormula("");
      }

      const parentSelect = parentOptions.find((p) => p.id === item.parentId) ?? null;
      setSelectedParent(parentSelect);
    }
  }, [type, shown, item, parentOptions]);

  const to01 = (v: any): number | undefined => {
    if (v === "" || v === null || v === undefined) return undefined;
    if (typeof v === "boolean") return v ? 1 : 0;
    const n = Number(v);
    if (Number.isNaN(n)) return undefined;
    return n > 0 ? 1 : 0;
  };

  const toInt = (v: any): number | undefined => {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  };

  const buildAttributesString = (): string | undefined => {
    const dt = datatype?.toLowerCase();

    if (dt === "dropdown" || dt === "radio" || dt === "multiselect") {
      const normalized = dropdownOptions
        .map((o) => ({ value: String(o.value || "").trim(), label: String(o.label || "").trim() }))
        .filter((o) => o.value || o.label);
      return normalized.length ? JSON.stringify(normalized) : undefined;
    }

    if (dt === "number") {
      const nf = String(numberFormat || "").trim();
      return nf ? JSON.stringify({ numberFormat: nf }) : undefined;
    }

    if (dt === "lookup") {
      const ref = String(detailLookup || "").trim();
      return ref ? JSON.stringify({ refType: ref }) : undefined;
    }

    if (dt === "formula") {
      const f = String(selectedFormula || "").trim();
      return f ? JSON.stringify({ formula: f }) : undefined;
    }

    // text/textarea/date/checkbox/attachment/others: allow free JSON text if provided
    const txt = String(attributesText || "").trim();
    return txt ? txt : undefined;
  };

  const clearTypeSpecificStates = (v: string) => {
    if (v === "number") {
      setNumberFormat("");
      setDropdownOptions([{ value: "", label: "" }]);
      setAttributesText("");
      setDetailLookup("contract");
      setSelectedFormula("");
    } else if (v === "dropdown" || v === "radio" || v === "multiselect") {
      setDropdownOptions([{ value: "", label: "" }]);
      setNumberFormat("");
      setAttributesText("");
      setDetailLookup("contract");
      setSelectedFormula("");
    } else if (v === "lookup") {
      setDetailLookup("contract");
      setDropdownOptions([{ value: "", label: "" }]);
      setNumberFormat("");
      setAttributesText("");
      setSelectedFormula("");
    } else if (v === "formula") {
      setSelectedFormula("");
      setDropdownOptions([{ value: "", label: "" }]);
      setNumberFormat("");
      setAttributesText("");
      setDetailLookup("contract");
    } else {
      // text/textarea/date/checkbox/attachment
      setAttributesText("");
      setDropdownOptions([{ value: "", label: "" }]);
      setNumberFormat("");
      setDetailLookup("contract");
      setSelectedFormula("");
    }
  };

  if (type === "add" || type === "edit" || type === "detail") {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {type === "add"
                    ? "Thêm trường thông tin khách hàng"
                    : type === "edit"
                      ? "Sửa trường thông tin khách hàng"
                      : "Chi tiết trường thông tin khách hàng"}
                </h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isDetail) return;

                  const fd = new FormData(e.target as HTMLFormElement);
                  const data = Object.fromEntries(fd.entries());

                  const name = String(data.name ?? "").trim();
                  const fieldName = String(data.fieldName ?? "").trim();
                  const dt = String(data.datatype ?? datatype ?? "")
                    .trim()
                    .toLowerCase();

                  const idNum = toInt(item?.id);
                  const parentId = toInt(data.parentId);
                  const position = toInt(data.position);

                  const payload: ICustomerAttributeRequest = {
                    name,
                    fieldName,
                    datatype: dt,
                    ...(idNum && idNum > 0 ? { id: idNum } : {}),
                    ...(buildAttributesString() ? { attributes: buildAttributesString() } : {}),
                    ...(to01(required) !== undefined ? { required: to01(required) } : {}),
                    ...(to01(readonly) !== undefined ? { readonly: to01(readonly) } : {}),
                    ...(to01(uniqued) !== undefined ? { uniqued: to01(uniqued) } : {}),
                    ...(typeof position === "number" ? { position } : {}),
                    ...(typeof parentId === "number" ? { parentId } : {}),
                    // pass custType using index signature support
                  };

                  onSubmit(payload);
                }}
              >
                <div className="modal-body row">
                  <div className="mb-2 col-md-6">
                    <label className="form-label">
                      Tên trường thông tin <span className="text-danger">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      required
                      placeholder="Nhập tên trường thông tin"
                      defaultValue={item?.name || ""}
                      {...inputProps}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">
                      Mã trường thông tin <span className="text-danger">*</span>
                    </label>
                    <input
                      name="fieldName"
                      type="text"
                      className="form-control"
                      required
                      placeholder="Nhập mã trường thông tin"
                      defaultValue={item?.fieldName || ""}
                      {...inputProps}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">
                      Kiểu dữ liệu <span className="text-danger">*</span>
                    </label>

                    <CustomSelect
                      value={datatypeOptions.find((o) => o.id === datatype) || null}
                      options={datatypeOptions}
                      onChange={(option: any) => {
                        const v = option ? String(option.id) : "";
                        setDatatype(v);
                        clearTypeSpecificStates(v);
                      }}
                      isDisabled={Boolean((inputProps as any)?.disabled)}
                      placeholder="Chọn kiểu dữ liệu"
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Thứ tự hiển thị</label>
                    <input
                      name="position"
                      type="number"
                      className="form-control"
                      placeholder="Nhập thứ tự hiển thị"
                      defaultValue={item?.position ?? 0}
                      {...inputProps}
                    />
                  </div>
                  <div className="mb-2 col-md-6">
                    <label className="form-label">Thuộc nhóm</label>
                    <CustomSelect
                      value={selectedParent}
                      options={parentOptions}
                      onChange={(option: any) => setSelectedParent(option)}
                      placeholder="Chọn nhóm"
                      isDisabled={parentOptions.length === 0}
                      isLoading={isloading}
                    />
                    <input type="hidden" name="parentId" value={selectedParent?.id ?? ""} />
                  </div>
                  {datatype !== "formula" && (
                    <div className="mb-2 col-md-6">
                      <label className="form-label">Trường bắt buộc nhập?</label>
                      <ul className="list-group list-group-horizontal mt-2 gap-4">
                        <li className="">
                          <input
                            className="form-check-input me-1"
                            type="radio"
                            name="required"
                            id="required1"
                            value="1"
                            checked={required === "1"}
                            onChange={(e) => setRequired(e.target.value as "0" | "1")}
                            disabled={Boolean((inputProps as any)?.disabled)}
                          />
                          <label className="form-check-label" htmlFor="required1">
                            Có
                          </label>
                        </li>
                        <li className="">
                          <input
                            className="form-check-input me-1"
                            type="radio"
                            name="required"
                            id="required0"
                            value="0"
                            checked={required === "0"}
                            onChange={(e) => setRequired(e.target.value as "0" | "1")}
                            disabled={Boolean((inputProps as any)?.disabled)}
                          />
                          <label className="form-check-label" htmlFor="required0">
                            Không
                          </label>
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="mb-2 col-md-6">
                    <label className="form-label">Trường duy nhất?</label>
                    <ul className="list-group list-group-horizontal mt-2 gap-4">
                      <li className="">
                        <input
                          className="form-check-input me-1"
                          type="radio"
                          name="uniqued"
                          id="uniqued1"
                          value="1"
                          checked={uniqued === "1"}
                          onChange={(e) => setUniqued(e.target.value as "0" | "1")}
                          disabled={Boolean((inputProps as any)?.disabled)}
                        />
                        <label className="form-check-label" htmlFor="uniqued1">
                          Có
                        </label>
                      </li>
                      <li className="">
                        <input
                          className="form-check-input me-1"
                          type="radio"
                          name="uniqued"
                          id="uniqued0"
                          value="0"
                          checked={uniqued === "0"}
                          onChange={(e) => setUniqued(e.target.value as "0" | "1")}
                          disabled={Boolean((inputProps as any)?.disabled)}
                        />
                        <label className="form-check-label" htmlFor="uniqued0">
                          Không
                        </label>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-2 col-md-6">
                    <label className="form-label">Chỉ cho phép đọc?</label>
                    <div className="form-check mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="readonly"
                        id="readonlyCheckbox"
                        checked={readonly === "1"}
                        onChange={(e) => setReadonly(e.target.checked ? "1" : "0")}
                        disabled={Boolean((inputProps as any)?.disabled)}
                      />
                      <label className="form-check-label" htmlFor="readonlyCheckbox">
                        Chỉ cho phép đọc
                      </label>
                    </div>
                  </div>

                  {/* Attributes section */}
                  {datatype === "number" && (
                    <div className="mb-2 col-12">
                      <label className="form-label d-block">Định dạng số</label>
                      {numberFormatPresets.map((fmt, idx) => (
                        <div className="form-check form-check-inline" key={fmt}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="numberFormatPreset"
                            id={`numberFormat_${idx}`}
                            value={fmt}
                            checked={numberFormat === fmt}
                            onChange={(e) => setNumberFormat(e.target.value)}
                            disabled={Boolean((inputProps as any)?.disabled)}
                          />
                          <label className="form-check-label" htmlFor={`numberFormat_${idx}`} style={{ fontSize: 14 }}>
                            {fmt}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  {(datatype === "dropdown" || datatype === "radio" || datatype === "multiselect") && (
                    <div className="mb-2 col-12">
                      <label className="form-label">Lựa chọn</label>
                      <div className="d-flex flex-column gap-2">
                        {dropdownOptions.map((opt, idx) => (
                          <div className="row g-2" key={idx}>
                            <div className="col-md-5 ps-0">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Giá trị"
                                value={opt.value}
                                onChange={(e) => {
                                  const next = [...dropdownOptions];
                                  next[idx] = { ...next[idx], value: e.target.value };
                                  setDropdownOptions(next);
                                }}
                                {...inputProps}
                              />
                            </div>
                            <div className="col-md-5">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Nhãn hiển thị"
                                value={opt.label}
                                onChange={(e) => {
                                  const next = [...dropdownOptions];
                                  next[idx] = { ...next[idx], label: e.target.value };
                                  setDropdownOptions(next);
                                }}
                                {...inputProps}
                              />
                            </div>
                            {!isDetail && (
                              <div className="col-md-2 d-flex">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger w-100"
                                  onClick={() => {
                                    const next = dropdownOptions.filter((_, i) => i !== idx);
                                    setDropdownOptions(next.length ? next : [{ value: "", label: "" }]);
                                  }}
                                >
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        {!isDetail && (
                          <div>
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => setDropdownOptions([...dropdownOptions, { value: "", label: "" }])}
                            >
                              + Thêm lựa chọn
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* {datatype === "lookup" && (
                    <div className="mb-2 col-md-6">
                      <label className="form-label">Thông tin tham chiếu</label>
                      <select className="form-select" value={detailLookup} onChange={(e) => setDetailLookup(e.target.value)} {...inputProps}>
                        {listLookup.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )} */}
                  {datatype === "formula" && (
                    <div className="mb-2 col-12">
                      <label className="form-label">Công thức tính</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Nhập công thức"
                        value={selectedFormula}
                        onChange={(e) => setSelectedFormula(e.target.value)}
                        {...inputProps}
                      />
                    </div>
                  )}
                  {/* {(datatype === "date" || datatype === "checkbox" || datatype === "attachment") && (
                    <div className="mb-2 col-12">
                      <label className="form-label">Thuộc tính (attributes) - JSON (tùy chọn)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder='Ví dụ: {"maxLength": 255}'
                        value={attributesText}
                        onChange={(e) => setAttributesText(e.target.value)}
                        {...inputProps}
                      />
                    </div>
                  )} */}
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
                <h5 className="mb-1">Xóa thuộc tính</h5>
                <p className="mb-3">Bạn có chắc muốn xóa thuộc tính đã chọn không?</p>
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
