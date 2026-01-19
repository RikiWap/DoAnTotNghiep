/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState, useRef } from "react";
import { getCookie, showToast } from "../../../utils/common";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import type { IProductResponse } from "../../../model/product/ProductResponseModel";
import type { IProductRequest } from "../../../model/product/ProductRequestModel";
import { uploadFile } from "../../../services/UploadFileService";
import ProductService from "../../../services/ProductService";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IProductResponse;
  onClose: () => void;
  onSubmit: (payload: IProductRequest) => void;
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

export default function ModalProduct({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  document.title = "Danh sách sản phẩm";
  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};
  const token = getCookie("token");

  const [avatar, setAvatar] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [unitOptions, setUnitOptions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [priceDisplay, setPriceDisplay] = useState<string>("");

  useEffect(() => {
    if ((type === "add" || type === "edit") && shown) {
      const fetchData = async () => {
        try {
          const [cateRes, unitRes] = await Promise.all([
            ProductService.getCategory({ page: 1, limit: 1000, level: 2, type: 1 }, token),
            ProductService.getUnit({ page: 1, limit: 1000 }, token),
          ]);

          if (cateRes?.code === 200) {
            setCategoryOptions(cateRes.result.items || []);
          }
          if (unitRes?.code === 200) {
            setUnitOptions(unitRes.result.items || []);
          }
        } catch (error) {
          console.error("Lỗi lấy dữ liệu tùy chọn:", error);
        }
      };
      fetchData();
    }
  }, [type, shown, token]);

  useEffect(() => {
    if ((type === "edit" || type === "detail") && item) {
      setAvatar(item.avatar || "");
      setPriceDisplay(formatMoney(item.price));
    } else if (type === "add") {
      setAvatar("");
      setSelectedCategory(null);
      setSelectedUnit(null);
      setPriceDisplay("");
    }
  }, [item, type, shown]);

  useEffect(() => {
    if (item && (type === "edit" || type === "detail")) {
      if (categoryOptions.length > 0) {
        const cate = categoryOptions.find((c) => c.id === item.categoryId);
        setSelectedCategory(cate || null);
      }
      if (unitOptions.length > 0) {
        const unit = unitOptions.find((u) => u.id === item.unitId);
        setSelectedUnit(unit || null);
      }
    }
  }, [categoryOptions, unitOptions, item, type]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      const response = await uploadFile(file, token);
      if (response && response.code === 200) {
        setAvatar(response.result);
        showToast("Upload ảnh thành công", "success");
      } else {
        showToast("Upload ảnh thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi upload", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "detail") return;

    const fd = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(fd.entries());

    const payload: IProductRequest = {
      name: String(data.name || ""),
      code: String(data.code || ""),
      content: String(data.content || ""),

      price: parseMoney(priceDisplay),

      discount: Number(data.discount || 0),
      discountUnit: Number(data.discountUnit || 1),
      position: Number(data.position || 0),
      expiredPeriod: Number(data.expiredPeriod || 0),
      status: Number(data.status || 1),
      avatar: avatar,
      categoryId: selectedCategory?.id,
      unitId: selectedUnit?.id,
    };

    if (type === "edit" && item?.id) {
      payload.id = item.id;
    }
    onSubmit(payload);
  };

  if (type === "add" || type === "edit" || type === "detail") {
    // if (!shown) return null;
    if (!type) return null;

    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal style={{ zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{type === "add" ? "Thêm sản phẩm" : type === "edit" ? "Cập nhật sản phẩm" : "Chi tiết sản phẩm"}</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body row custom-modal-scroll">
                  <div className="col-lg-3 text-center mb-3">
                    <label className="form-label fw-bold">Ảnh đại diện</label>
                    <div
                      className="border rounded d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden mx-auto"
                      style={{
                        width: "100%",
                        maxWidth: "200px",
                        aspectRatio: "1/1",
                        cursor: type !== "detail" && !uploading ? "pointer" : "default",
                      }}
                      onClick={() => type !== "detail" && !uploading && fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : avatar ? (
                        <img src={avatar} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <div className="text-muted">
                          <i className="ti ti-photo fs-1"></i>
                          <p className="small mb-0">Tải ảnh lên</p>
                        </div>
                      )}

                      {type !== "detail" && (
                        <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                      )}
                    </div>
                  </div>

                  <div className="col-lg-9">
                    <div className="row">
                      <div className="mb-3 col-md-4">
                        <label className="form-label">
                          Mã sản phẩm <span className="text-danger">*</span>
                        </label>
                        <input
                          name="code"
                          type="text"
                          className="form-control"
                          placeholder="Nhập mã sản phẩm"
                          required
                          defaultValue={item?.code || ""}
                          {...inputProps}
                        />
                      </div>
                      <div className="mb-3 col-md-8">
                        <label className="form-label">
                          Tên sản phẩm <span className="text-danger">*</span>
                        </label>
                        <input
                          name="name"
                          type="text"
                          className="form-control"
                          placeholder="Nhập tên sản phẩm"
                          required
                          defaultValue={item?.name || ""}
                          {...inputProps}
                        />
                      </div>

                      <div className="mb-3 col-md-4">
                        <label className="form-label">Danh mục</label>
                        <CustomSelect
                          options={categoryOptions}
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                          isDisabled={!!inputProps.disabled}
                          placeholder="Chọn danh mục"
                        />
                      </div>
                      <div className="mb-3 col-md-4">
                        <label className="form-label">Đơn vị tính</label>
                        <CustomSelect
                          options={unitOptions}
                          value={selectedUnit}
                          onChange={setSelectedUnit}
                          isDisabled={!!inputProps.disabled}
                          placeholder="Chọn đơn vị"
                        />
                      </div>

                      <div className="mb-3 col-md-4">
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
                      <div className="mb-3 col-md-4">
                        <label className="form-label">Giảm giá</label>
                        <div className="input-group">
                          <input name="discount" type="number" className="form-control" defaultValue={item?.discount || 0} min={0} {...inputProps} />
                          <select
                            name="discountUnit"
                            className="form-select"
                            style={{ maxWidth: "64px" }}
                            defaultValue={item?.discountUnit || 1}
                            disabled={!!inputProps.disabled}
                          >
                            <option value={1}>%</option>
                            <option value={2}>$</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-3 col-md-4">
                        <label className="form-label">Hạn sử dụng (Tháng)</label>
                        <input
                          name="expiredPeriod"
                          type="number"
                          className="form-control"
                          defaultValue={item?.expiredPeriod || 0}
                          placeholder="Nhập hạn sử dụng"
                          {...inputProps}
                        />
                      </div>

                      <div className="mb-3 col-md-4">
                        <label className="form-label">Thứ tự hiển thị</label>
                        <input name="position" type="number" className="form-control" defaultValue={item?.position || 1} {...inputProps} />
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

                      <div className="col-12">
                        <label className="form-label">Mô tả chi tiết</label>
                        <textarea
                          name="content"
                          className="form-control"
                          rows={4}
                          defaultValue={item?.content || ""}
                          placeholder="Nhập mô tả sản phẩm..."
                          {...inputProps}
                        />
                      </div>
                    </div>
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

  // --- DELETE MODAL ---
  if (type === "delete" && item) {
    // if (!shown) return null;
    if (!type) return null;

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
                <h5 className="mb-1">Xóa sản phẩm?</h5>
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
        <div className={`modal-backdrop fade ${shown ? "show" : ""}`} style={{ zIndex: 1090 }} />
      </Fragment>
    );
  }

  return null;
}
