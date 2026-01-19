/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useState, useRef } from "react";
import { getCookie, showToast } from "../../../utils/common";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import type { IServiceRequest, IComboItem } from "../../../model/service/ServiceRequestModel";
import { uploadFile } from "../../../services/UploadFileService";
import CategoryService from "../../../services/CategoryService";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IServiceRequest;
  onClose: () => void;
  onSubmit: (payload: IServiceRequest) => void;
  onDelete?: () => void;
};

const formatMoney = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  return String(value)
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseMoney = (value: string | undefined): number => {
  if (!value) return 0;
  return Number(String(value).replace(/\./g, ""));
};

export default function ModalService({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};
  const token = getCookie("token");

  const [avatar, setAvatar] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [isCombo, setIsCombo] = useState<number>(0);
  const [comboItems, setComboItems] = useState<IComboItem[]>([]);

  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [costDisplay, setCostDisplay] = useState<string>("");

  useEffect(() => {
    if ((type === "add" || type === "edit") && shown) {
      CategoryService.list({ page: 1, limit: 1000 }, token).then((res: any) => {
        if (res?.code === 200) setCategoryOptions(res.result.items || []);
      });
    }

    if (shown) {
      if (type === "add") {
        setAvatar("");
        setIsCombo(0);
        setComboItems([]);
        setSelectedCategory(null);
        setPriceDisplay("");
        setCostDisplay("");
      } else if ((type === "edit" || type === "detail") && item) {
        setAvatar(item.avatar || "");
        setIsCombo(item.isCombo || 0);
        setPriceDisplay(formatMoney(item.price));
        setCostDisplay(formatMoney(item.cost));

        try {
          const parsedCombos = item.priceVariation ? JSON.parse(item.priceVariation) : [];
          setComboItems(parsedCombos);
        } catch (e) {
          setComboItems([]);
        }
      }
    }
  }, [type, shown, item, token]);

  useEffect(() => {
    if (item && (type === "edit" || type === "detail") && categoryOptions.length > 0) {
      const cate = categoryOptions.find((c) => c.id === item.categoryId);
      setSelectedCategory(cate || null);
    }
  }, [categoryOptions, item, type]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, token);
      if (res && res.code === 200) setAvatar(res.result);
      else showToast("Upload thất bại", "error");
    } catch {
      showToast("Lỗi kết nối", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addComboRow = () => {
    setComboItems([
      ...comboItems,
      {
        priceId: `new_${Date.now()}`,
        name: "",
        price: 0,
        discount: 0,
        treatmentNum: 1,
      },
    ]);
  };

  const removeComboRow = (index: number) => {
    const newItems = [...comboItems];
    newItems.splice(index, 1);
    setComboItems(newItems);
  };

  const updateComboRow = (index: number, field: keyof IComboItem, value: any) => {
    const newItems = [...comboItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setComboItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "detail") return;

    const fd = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());

    const payload: IServiceRequest = {
      id: item?.id,
      name: String(data.name || ""),
      code: String(data.code || ""),
      intro: String(data.intro || ""),
      categoryId: selectedCategory?.id,
      avatar: avatar,

      // 3. Parse lại từ chuỗi hiển thị (ví dụ "800.000") về số (800000)
      cost: parseMoney(costDisplay),
      price: parseMoney(priceDisplay),

      discount: Number(data.discount || 0),
      totalTime: Number(data.totalTime || 0),
      treatmentNum: Number(data.treatmentNum || 1),
      isCombo: isCombo,
      featured: data.featured ? 1 : 0,
      priceVariation: JSON.stringify(comboItems),
      parentId: item?.parentId || 0,
    };

    onSubmit(payload);
  };

  if (!type) return null;

  if (type === "delete" && item) {
    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal style={{ zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-body p-4 text-center">
                <h5 className="mb-1">Xóa dịch vụ?</h5>
                <p className="mb-3">Bạn chắc chắn muốn xóa "{item.name}"?</p>
                <div className="d-flex justify-content-center gap-2">
                  <button type="button" className="btn btn-light w-100" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn-primary w-100" onClick={onDelete}>
                    Xóa
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
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{type === "add" ? "Thêm dịch vụ mới" : type === "edit" ? "Cập nhật dịch vụ" : "Chi tiết dịch vụ"}</h5>
              <button className="btn-close custom-btn-close" onClick={onClose} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body row custom-modal-scroll">
                <div className="col-lg-3 text-center mb-3">
                  <label className="form-label fw-bold">Ảnh đại diện</label>
                  <div
                    className="border rounded d-flex align-items-center justify-content-center bg-light mx-auto position-relative"
                    style={{ width: "100%", maxWidth: "200px", aspectRatio: "1/1", cursor: type !== "detail" ? "pointer" : "default" }}
                    onClick={() => type !== "detail" && !uploading && fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <div className="spinner-border text-primary" />
                    ) : avatar ? (
                      <img src={avatar} alt="Avatar" className="w-100 h-100 object-fit-cover rounded" />
                    ) : (
                      <div className="text-muted">
                        <i className="ti ti-photo fs-1"></i>
                        <p>Tải ảnh</p>
                      </div>
                    )}
                    {type !== "detail" && <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleFileChange} />}
                  </div>
                </div>

                <div className="col-lg-9">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Tên dịch vụ <span className="text-danger">*</span>
                      </label>
                      <input name="name" className="form-control" defaultValue={item?.name} required {...inputProps} placeholder="Nhập tên dịch vụ" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Danh mục</label>
                      <CustomSelect
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        isDisabled={!!inputProps.disabled}
                        placeholder="Chọn danh mục"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Mã dịch vụ</label>
                      <input name="code" className="form-control" defaultValue={item?.code} {...inputProps} placeholder="Nhập mã dịch vụ" />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Giá bán (VNĐ)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={priceDisplay}
                        onChange={(e) => setPriceDisplay(formatMoney(e.target.value))}
                        {...inputProps}
                        placeholder="0"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Giá vốn (VNĐ)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={costDisplay}
                        onChange={(e) => setCostDisplay(formatMoney(e.target.value))}
                        {...inputProps}
                        placeholder="0"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">Giảm giá (%)</label>
                      <input name="discount" type="number" className="form-control" defaultValue={item?.discount} {...inputProps} placeholder="0" />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Số buổi</label>
                      <input
                        name="treatmentNum"
                        type="number"
                        className="form-control"
                        defaultValue={item?.treatmentNum}
                        {...inputProps}
                        placeholder="1"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Thời gian (phút)</label>
                      <input name="totalTime" type="number" className="form-control" defaultValue={item?.totalTime} {...inputProps} placeholder="0" />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label d-block">Loại dịch vụ</label>
                      <div className="d-flex gap-4 mt-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="isComboRadio"
                            id="typeNormal"
                            checked={isCombo === 0}
                            onChange={() => setIsCombo(0)}
                            disabled={!!inputProps.disabled}
                          />
                          <label className="form-check-label" htmlFor="typeNormal">
                            Thường
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="isComboRadio"
                            id="typeCombo"
                            checked={isCombo === 1}
                            onChange={() => setIsCombo(1)}
                            disabled={!!inputProps.disabled}
                          />
                          <label className="form-check-label" htmlFor="typeCombo">
                            Combo
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label d-block">Dịch vụ nổi bật</label>
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="featured"
                          id="featuredCheck"
                          value="1"
                          defaultChecked={item?.featured === 1}
                          {...inputProps}
                        />
                        <label className="form-check-label" htmlFor="featuredCheck">
                          Là dịch vụ nổi bật
                        </label>
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">Giới thiệu</label>
                      <textarea
                        name="intro"
                        className="form-control"
                        rows={3}
                        defaultValue={item?.intro}
                        {...inputProps}
                        placeholder="Nhập giới thiệu"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {isCombo === 1 && (
                  <div className="col-12 mt-3 border-top pt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold text-primary">
                        <i className="ti ti-table me-1"></i>Bảng giá Combo
                      </h6>
                      {type !== "detail" && (
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addComboRow}>
                          <i className="ti ti-plus"></i> Thêm dòng
                        </button>
                      )}
                    </div>

                    <div className="table-responsive bg-light rounded p-2">
                      <table className="table table-bordered table-sm bg-white mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Tên gói combo</th>
                            <th style={{ width: 200 }}>Giá bán (VNĐ)</th>
                            <th style={{ width: 200 }}>Giảm giá (VNĐ)</th>
                            <th style={{ width: 100 }}>Số buổi</th>
                            {type !== "detail" && <th style={{ width: 50 }}></th>}
                          </tr>
                        </thead>
                        <tbody>
                          {comboItems.map((combo, idx) => (
                            <tr key={idx}>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={combo.name}
                                  onChange={(e) => updateComboRow(idx, "name", e.target.value)}
                                  placeholder="Nhập tên combo..."
                                  {...inputProps}
                                />
                              </td>
                              {/* 6. Combo Price Formatted */}
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={formatMoney(combo.price)}
                                  onChange={(e) => updateComboRow(idx, "price", parseMoney(e.target.value))}
                                  {...inputProps}
                                />
                              </td>
                              {/* 7. Combo Discount Formatted */}
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={formatMoney(combo.discount)}
                                  onChange={(e) => updateComboRow(idx, "discount", parseMoney(e.target.value))}
                                  {...inputProps}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={combo.treatmentNum}
                                  onChange={(e) => updateComboRow(idx, "treatmentNum", Number(e.target.value))}
                                  {...inputProps}
                                />
                              </td>
                              {type !== "detail" && (
                                <td className="text-center">
                                  <button type="button" className="btn btn-sm text-danger" onClick={() => removeComboRow(idx)}>
                                    <i className="ti ti-trash"></i>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                          {comboItems.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center text-muted py-3">
                                Chưa có combo nào. Hãy bấm "Thêm dòng".
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                      {uploading ? "Đang xử lý..." : type === "add" ? "Tạo mới" : "Lưu thay đổi"}
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
