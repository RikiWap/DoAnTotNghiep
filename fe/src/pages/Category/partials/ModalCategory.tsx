/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment, useEffect, useRef, useState } from "react";
import { getCookie, showToast } from "../../../utils/common";
import CustomSelect from "../../../components/CustomSelect/CustomSelect"; //
import { uploadFile } from "../../../services/UploadFileService";
import CategoryService from "../../../services/CategoryService";
import type { ICategoryRequest } from "../../../model/category/CategoryRequestModel"; //
import type { ICategoryResponse } from "../../../model/category/CategoryResponseModel"; //

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: ICategoryResponse;
  onClose: () => void;
  onSubmit: (payload: ICategoryRequest) => void;
  onDelete?: () => void;
};

const typeOptions = [
  { id: 1, name: "Dịch vụ" },
  { id: 2, name: "Sản phẩm" },
];

export default function ModalCategory({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const inputProps = type === "detail" ? { disabled: true, readOnly: true } : {};
  const token = getCookie("token");
  const [avatar, setAvatar] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parentOptions, setParentOptions] = useState<any[]>([]);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(typeOptions[0]);

  useEffect(() => {
    if ((type === "add" || type === "edit") && shown) {
      const fetchParents = async () => {
        try {
          const res = await CategoryService.list({ page: 1, limit: 1000, level: 0 }, token); //
          if (res?.code === 200) {
            const options = res.result.items?.filter((i: ICategoryResponse) => i.id !== item?.id) || [];
            setParentOptions([{ id: 0, name: "--- Là danh mục gốc ---" }, ...options]);
          }
        } catch (error) {
          console.error("Lỗi lấy danh mục cha:", error);
        }
      };
      fetchParents();
    }
  }, [type, shown, token, item]);

  useEffect(() => {
    if ((type === "edit" || type === "detail") && item) {
      setAvatar(item.avatar || "");
      if (item.parentId === 0) {
        setSelectedParent({ id: 0, name: "Là danh mục gốc" });
      } else {
        const parent = parentOptions.find((p) => p.id === item.parentId);
        setSelectedParent(parent || null);
      }
      const foundType = typeOptions.find((t) => t.id === item.type);
      setSelectedType(foundType || typeOptions[0]);
    } else if (type === "add") {
      setAvatar("");
      setSelectedParent({ id: 0, name: "Là danh mục gốc" });
      setSelectedType(typeOptions[0]);
    }
  }, [item, type, shown, parentOptions]);

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

    const payload: ICategoryRequest = {
      name: String(data.name || ""),

      type: selectedType?.id || 1,

      parentId: selectedParent?.id || 0,
      featured: String(data.featured || ""),
      position: Number(data.position || 0),
      active: Number(data.active || 1),
      avatar: avatar,
    };

    if (type === "edit" && item?.id) {
      payload.id = item.id;
    }
    onSubmit(payload);
  };

  if (type === "add" || type === "edit" || type === "detail") {
    if (!type) return null;

    return (
      <Fragment>
        <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal style={{ zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{type === "add" ? "Thêm danh mục" : type === "edit" ? "Cập nhật danh mục" : "Chi tiết danh mục"}</h5>
                <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body row custom-modal-scroll">
                  <div className="col-lg-4 text-center mb-3">
                    <label className="form-label fw-bold">Ảnh đại diện</label>
                    <div
                      className="border rounded d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden mx-auto"
                      style={{
                        width: "100%",
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

                  {/* Cột Phải: Form Fields */}
                  <div className="col-lg-8">
                    <div className="row">
                      <div className="mb-3 col-12">
                        <label className="form-label">
                          Tên danh mục <span className="text-danger">*</span>
                        </label>
                        <input
                          name="name"
                          type="text"
                          className="form-control"
                          placeholder="Nhập tên danh mục"
                          required
                          defaultValue={item?.name || ""}
                          {...inputProps}
                        />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label className="form-label">Loại danh mục</label>
                        <CustomSelect
                          options={typeOptions}
                          value={selectedType}
                          onChange={setSelectedType}
                          isDisabled={!!inputProps.disabled}
                          placeholder="Chọn loại"
                        />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label className="form-label">Danh mục cha</label>
                        <CustomSelect
                          options={parentOptions}
                          value={selectedParent}
                          onChange={setSelectedParent}
                          isDisabled={!!inputProps.disabled}
                          placeholder="Chọn danh mục cha"
                        />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label className="form-label">Thứ tự hiển thị</label>
                        <input name="position" type="number" className="form-control" defaultValue={item?.position || 1} {...inputProps} />
                      </div>

                      <div className="mb-3 col-md-6">
                        <label className="form-label">Trạng thái</label>
                        <div className="mt-2">
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="active"
                              id="active1"
                              value={1}
                              defaultChecked={item?.active === 1 || item?.active === undefined}
                              disabled={!!inputProps.disabled}
                            />
                            <label className="form-check-label" htmlFor="active1">
                              Hoạt động
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="active"
                              id="active0"
                              value={0}
                              defaultChecked={item?.active === 0}
                              disabled={!!inputProps.disabled}
                            />
                            <label className="form-check-label" htmlFor="active0">
                              Ngừng
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Mô tả</label>
                        <textarea
                          name="featured"
                          className="form-control"
                          rows={3}
                          defaultValue={item?.featured || ""}
                          placeholder="Nhập mô tả"
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
                <h5 className="mb-1">Xóa danh mục?</h5>
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
