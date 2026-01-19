/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { IBranchResponse } from "../../../model/branch/BranchResponseModel";
import type { IBranchRequest } from "../../../model/branch/BranchRequestModel";
import { getCookie } from "../../../utils/common";
import { uploadFile } from "../../../services/UploadFileService";
import BranchService from "../../../services/BranchService";
import UserService from "../../../services/UserService";
import "./ModalBranch.scss";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import { useCollapse } from "../../../hooks/useCollapse";

type ModalType = "add" | "edit" | "delete" | "detail";

type ModalProps = {
  type: ModalType | null;
  shown: boolean;
  item?: IBranchResponse;
  onClose: () => void;
  onSubmit: (payload: IBranchRequest) => void;
  onDelete?: () => void;
};

type OffcanvasMode = "add" | "edit";

type OffcanvasBodyProps = {
  mode: OffcanvasMode;
  shown: boolean;
  item?: IBranchResponse;
  avatar: string;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: (payload: IBranchRequest) => void;
  parentOptions: IBranchResponse[];
  userOptions: Array<{ id?: number | string; name?: string }>;
  selectedParent: IBranchResponse | null;
  setSelectedParent: (value: any) => void;
  selectedOwner: { id?: number | string; name?: string } | null;
  setSelectedOwner: (value: any) => void;
};

function OffcanvasBody({
  mode,
  shown,
  item,
  avatar,
  uploading,
  fileInputRef,
  onFileChange,
  onClose,
  onSubmit,
  parentOptions,
  userOptions,
  selectedParent,
  setSelectedParent,
  selectedOwner,
  setSelectedOwner,
}: OffcanvasBodyProps) {
  const title = mode === "add" ? "Thêm chi nhánh" : "Sửa chi nhánh";

  const idPrefix = useMemo(() => {
    if (item && (item as any).id) return `branch_${(item as any).id}`;
    return `branch_new_${Date.now()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const basicId = `${idPrefix}_basic_modal`;
  const contactId = `${idPrefix}_contact_modal`;
  const basic = useCollapse(true);
  const contact = useCollapse(false);

  return (
    <div
      className={`offcanvas offcanvas-end offcanvas-large ${shown ? " show" : ""}`}
      tabIndex={-1}
      // style={{ visibility: shown ? "visible" : "hidden" }}
      style={{ visibility: "visible" }}
    >
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

            const payload: IBranchRequest = {
              ...data,
              name: String(data.name || ""),
              parentId: selectedParent?.id ? Number(selectedParent.id) : undefined,
              avatar,
              address: String(data.address || ""),
              website: String(data.website || ""),
              description: String(data.description || ""),
              foundingYear: data.foundingYear ? Number(data.foundingYear) : undefined,
              foundingMonth: data.foundingMonth ? Number(data.foundingMonth) : undefined,
              foundingDay: data.foundingDay ? Number(data.foundingDay) : undefined,
              phone: String(data.phone || ""),
              email: String(data.email || ""),
              ownerId: selectedOwner?.id ? Number(selectedOwner.id) : undefined,
              status: data.status ? Number(data.status) : 1,
            };

            if (mode === "edit" && item?.id) {
              payload.id = item.id;
            }

            onSubmit(payload);
          }}
        >
          <div className="accordion accordion-bordered" id="branch_main_accordion_modal">
            {/* THÔNG TIN CƠ BẢN */}
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
                    {/* Upload ảnh */}
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
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                opacity: 0,
                                width: "100%",
                                height: "100%",
                                cursor: "pointer",
                              }}
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

                    {/* Tên chi nhánh */}
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        Tên chi nhánh <span className="text-danger">*</span>
                      </label>
                      <input
                        name="name"
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên chi nhánh"
                        required
                        defaultValue={item?.name || ""}
                      />
                    </div>

                    {/* Ngày / Tháng / Năm thành lập */}
                    <div className="mb-3 col-md-4">
                      <label className="form-label">Ngày thành lập</label>
                      <input
                        name="foundingDay"
                        type="number"
                        className="form-control"
                        placeholder="Ngày"
                        min={1}
                        max={31}
                        defaultValue={item?.foundingDay != null ? String(item.foundingDay) : ""}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label className="form-label">Tháng thành lập</label>
                      <input
                        name="foundingMonth"
                        type="number"
                        className="form-control"
                        placeholder="Tháng"
                        min={1}
                        max={12}
                        defaultValue={item?.foundingMonth != null ? String(item.foundingMonth) : ""}
                      />
                    </div>
                    <div className="mb-3 col-md-4">
                      <label className="form-label">Năm thành lập</label>
                      <input
                        name="foundingYear"
                        type="number"
                        className="form-control"
                        placeholder="Năm"
                        defaultValue={item?.foundingYear != null ? String(item.foundingYear) : ""}
                      />
                    </div>

                    {/* Trạng thái */}
                    <div className="mb-3 col-12">
                      <label className="form-label">Trạng thái</label>
                      <ul className="list-group list-group-horizontal mt-2 gap-4">
                        <li>
                          <input
                            className="form-check-input me-1"
                            type="radio"
                            name="status"
                            id="branch_active1"
                            value={1}
                            defaultChecked={item?.status === 1 || !item?.status}
                          />
                          <label className="form-check-label" htmlFor="branch_active1">
                            Đang hoạt động
                          </label>
                        </li>
                        <li>
                          <input
                            className="form-check-input me-1"
                            type="radio"
                            name="status"
                            id="branch_active0"
                            value={0}
                            defaultChecked={item?.status === 0}
                          />
                          <label className="form-check-label" htmlFor="branch_active0">
                            Ngưng hoạt động
                          </label>
                        </li>
                      </ul>
                    </div>

                    {/* Mô tả */}
                    <div className="mb-2 col-12">
                      <label className="form-label">Mô tả ngắn</label>
                      <textarea
                        name="description"
                        className="form-control"
                        placeholder="Nhập mô tả"
                        rows={3}
                        defaultValue={item?.description || ""}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* THÔNG TIN LIÊN HỆ */}
            <div className="accordion-item border-top rounded mb-3">
              <div className="accordion-header">
                <button
                  type="button"
                  className={`accordion-button accordion-custom-button ${contact.isOpen ? "" : "collapsed"} rounded`}
                  aria-expanded={!!contact.isOpen}
                  aria-controls={contactId}
                  onClick={() => contact.toggle()}
                >
                  <span className="avatar avatar-md rounded me-1">
                    <i className="ti ti-info-circle"></i>
                  </span>
                  Thông tin liên hệ
                </button>
              </div>

              <div id={contactId} ref={contact.ref} className={`accordion-collapse collapse ${contact.isOpen ? "show" : ""}`}>
                <div className="accordion-body border-top">
                  <div className="row">
                    {/* Địa chỉ */}
                    <div className="mb-3 col-md-6">
                      <label className="form-label">
                        Địa chỉ <span className="text-danger">*</span>
                      </label>
                      <input
                        name="address"
                        type="text"
                        className="form-control"
                        placeholder="Nhập địa chỉ"
                        required
                        defaultValue={item?.address || ""}
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div className="mb-3 col-md-6">
                      <label className="form-label">
                        Số điện thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        name="phone"
                        type="text"
                        className="form-control"
                        placeholder="Nhập số điện thoại"
                        required
                        defaultValue={item?.phone || ""}
                      />
                    </div>

                    {/* Email liên hệ */}
                    <div className="mb-3 col-md-6">
                      <label className="form-label">
                        Email liên hệ <span className="text-danger">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        className="form-control"
                        placeholder="Nhập email liên hệ"
                        required
                        defaultValue={item?.email || ""}
                      />
                    </div>

                    {/* Website */}
                    <div className="mb-3 col-md-6">
                      <label className="form-label">Website</label>
                      <input
                        name="website"
                        type="text"
                        className="form-control"
                        placeholder="Nhập địa chỉ website"
                        defaultValue={item?.website || ""}
                      />
                    </div>

                    {/* Người phụ trách */}
                    <div className="mb-3 col-md-6">
                      <label className="form-label">Người phụ trách</label>
                      <CustomSelect
                        value={selectedOwner}
                        options={userOptions}
                        onChange={(option: any) => setSelectedOwner(option)}
                        placeholder="Chọn người phụ trách"
                        isDisabled={userOptions.length === 0}
                      />
                    </div>

                    {/* Chi nhánh cha */}
                    <div className="mb-3 col-md-6">
                      <label className="form-label">Chi nhánh cha</label>
                      <CustomSelect
                        value={selectedParent}
                        options={parentOptions}
                        onChange={(option: any) => setSelectedParent(option)}
                        placeholder="Chọn chi nhánh cha"
                        isDisabled={parentOptions.length === 0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-3 d-flex justify-content-end gap-2">
            <button className="btn btn-light" type="button" onClick={onClose}>
              Huỷ
            </button>
            <button className="btn btn-primary" type="submit">
              {mode === "add" ? "Tạo mới" : "Lưu thay đổi"}
            </button>
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
      <div className={`modal fade ${shown ? "show d-block" : "d-block"}`} aria-modal>
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0 border-radius">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24"></i>
                </span>
              </div>
              <h5 className="mb-1">Xóa chi nhánh</h5>
              <p className="mb-3">Bạn có chắc muốn xóa chi nhánh đã chọn không?</p>
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

type DetailModalProps = {
  shown: boolean;
  onClose: () => void;
  item: IBranchResponse;
  parentOptions: IBranchResponse[];
  userOptions: Array<{ id?: number | string; name?: string }>;
};

function DetailModal({ shown, onClose, item, parentOptions, userOptions }: DetailModalProps) {
  return (
    <Fragment>
      <div className={`modal fade ${shown ? "show d-block" : "d-none"}`} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="modal-header">
              <h5 className="modal-title">Chi tiết chi nhánh</h5>
              <button className="btn-close custom-btn-close border p-1 me-0 text-dark" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="text-center mb-4">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="rounded-circle shadow-sm border border-2 border-light"
                    style={{ width: 120, height: 120, objectFit: "cover" }}
                  />
                ) : (
                  <div className="avatar-placeholder bg-light text-muted d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm">
                    No Avatar
                  </div>
                )}
                <h6 className="mt-3 fw-bold">{item.name}</h6>
              </div>

              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Chi nhánh cha:</strong> {parentOptions?.find((b) => b.id === item.parentId)?.name || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Địa chỉ:</strong> {item.address || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Website:</strong> {item.website || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Mô tả:</strong> {item.description || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Ngày thành lập:</strong>{" "}
                  {item.foundingDay && item.foundingMonth && item.foundingYear
                    ? `${item.foundingDay}/${item.foundingMonth}/${item.foundingYear}`
                    : "-"}
                </li>
                <li className="list-group-item">
                  <strong>SĐT:</strong> {item.phone || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Email:</strong> {item.email || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Người phụ trách:</strong> {userOptions?.find((u) => u.id === item.ownerId)?.name || "-"}
                </li>
                <li className="list-group-item">
                  <strong>Trạng thái:</strong>{" "}
                  {item.status === 1 ? (
                    <span className="badge badge-soft-success ">Hoạt động</span>
                  ) : (
                    <span className="badge badge-soft-danger">Ngưng hoạt động</span>
                  )}
                </li>
                <li className="list-group-item">
                  <strong>Ngày tạo:</strong> {item.createdTime ? new Date(item.createdTime).toLocaleDateString() : "-"}
                </li>
              </ul>
            </div>
            <div className="modal-footer">
              <div className="d-flex align-items-center justify-content-end m-0">
                <button type="button" className="btn btn-primary" onClick={onClose}>
                  Đóng
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

export default function ModalBranch({ type, shown, item, onClose, onSubmit, onDelete }: ModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatar, setAvatar] = useState<string>(item?.avatar || "");
  const [uploading, setUploading] = useState<boolean>(false);
  const token = getCookie("token");
  const [parentOptions, setParentOptions] = useState<IBranchResponse[]>([]);
  const [userOptions, setUserOptions] = useState<Array<{ id?: number | string; name?: string }>>([]);
  const [selectedParent, setSelectedParent] = useState<IBranchResponse | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<{ id?: number | string; name?: string } | null>(null);

  useEffect(() => {
    if (type === "add" || type === "edit" || type === "detail") {
      (async () => {
        const res = await BranchService.list({ page: 1, limit: 1000 }, token);
        if (res && res.code === 200 && res.result?.items) {
          setParentOptions(res.result.items);
        } else {
          setParentOptions([]);
        }
      })();

      (async () => {
        const res = await UserService.list({ page: 1, limit: 1000 }, token);
        if (res && res.code === 200 && res.result?.items) {
          setUserOptions(res.result.items);
        } else {
          setUserOptions([]);
        }
      })();

      setAvatar(item?.avatar || "");
    }
  }, [type, shown, token, item?.avatar]);

  useEffect(() => {
    const parentSelect = item ? (parentOptions.find((p) => p.id === item.parentId) ?? null) : null;
    const ownerSelect = item ? (userOptions.find((u) => u.id === item.ownerId) ?? null) : null;

    setSelectedParent(parentSelect);
    setSelectedOwner(ownerSelect);
  }, [item, parentOptions, userOptions]);

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

  return (
    <Fragment>
      {(type === "add" || type === "edit") && (
        <OffcanvasBody
          mode={type}
          shown={shown}
          item={item}
          avatar={avatar}
          uploading={uploading}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onClose={onClose}
          onSubmit={onSubmit}
          parentOptions={parentOptions}
          userOptions={userOptions}
          selectedParent={selectedParent}
          setSelectedParent={setSelectedParent}
          selectedOwner={selectedOwner}
          setSelectedOwner={setSelectedOwner}
        />
      )}

      {type === "delete" && item && <DeleteModal shown={shown} onClose={onClose} onDelete={onDelete} />}

      {type === "detail" && item && (
        <DetailModal shown={shown} onClose={onClose} item={item} parentOptions={parentOptions} userOptions={userOptions} />
      )}

      {(type === "add" || type === "edit") && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
    </Fragment>
  );
}
