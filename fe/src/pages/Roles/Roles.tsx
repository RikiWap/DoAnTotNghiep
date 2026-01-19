/* eslint-disable react-hooks/exhaustive-deps */
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { renderIndex, showToast } from "./../../utils/common";
import { getCookie } from "../../utils/common";
import { runWithDelay } from "../../utils/common";
import Table from "../../components/Table/Table";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { roleBreadcrumbItems } from "../../utils/breadcrumbs";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import Pagination from "../../components/Pagination/Pagination";
import RoleService from "../../services/RoleService";
import type { IRoleItem } from "../../model/roles/RoleResponseModel";
import type { IRoleUpdateRequest, IRoleListRequest } from "../../model/roles/RoleRequestModel";
import { usePagination } from "../../hooks/usePagination";
// import BulkAction from "../../components/bulkAction/bulkAction";
import ModalRole from "./partials/ModalRole";
import Loading from "../../components/Loading/Loading";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import { useRedirectIfNoToken, useModalFade, useCloseModal } from "../../utils/common";
import type { ModalState } from "../../utils/common";

export default function RolesAndPermissions() {
  const [listRoles, setListRoles] = useState<IRoleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const [params, setParams] = useState<IRoleListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [selectedRows, setSelectedRows] = useState<IRoleItem[]>([]);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const token = getCookie("token");
  const navigate = useNavigate();
  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);
  const [canPermission, setCanPermission] = useState<boolean | null>(null);

  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);

  useEffect(() => {
    const valView = localStorage.getItem("ROLE_VIEW");
    const valAdd = localStorage.getItem("ROLE_ADD");
    const valDelete = localStorage.getItem("ROLE_DELETE");
    const valEdit = localStorage.getItem("ROLE_UPDATE");
    const valPermission = localStorage.getItem("PERMISSION_VIEW");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanDelete(valDelete === "1");
    setCanEdit(valEdit === "1");
    setCanPermission(valPermission === "1");
  }, []);

  useEffect(() => {
    getListRoles(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListRoles = async (paramsSearch: IRoleListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => RoleService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListRoles(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddRole = async (payload: IRoleUpdateRequest) => {
    setIsLoading(true);
    const response = await RoleService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm vai trò thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListRoles({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm vai trò thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditRole = async (payload: IRoleUpdateRequest) => {
    setIsLoading(true);
    const response = await RoleService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật vai trò thành công!", "success");
      closeModal();
      await getListRoles(params);
    } else {
      showToast(response?.message ?? "Cập nhật vai trò thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteRole = async () => {
    if (!modal.item) return;
    const roleItem = modal.item as IRoleItem;
    setIsLoading(true);
    const response = await RoleService.delete(roleItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listRoles.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa vai trò thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListRoles({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa vai trò thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleTogglePermission = async (role: IRoleItem, field: "isDefault" | "isOperator") => {
    setUpdatingIds((prev) => [...prev, role.id]);
    const payload: IRoleUpdateRequest = {
      id: role.id,
      name: role.name,
      isDefault: field === "isDefault" ? (Number(role.isDefault) === 1 ? 0 : 1) : role.isDefault,
      isOperator: field === "isOperator" ? (Number(role.isOperator) === 1 ? 0 : 1) : role.isOperator,
    };
    const response = await RoleService.update(payload, token);
    if (response && response.code === 200) {
      setListRoles((prev) =>
        prev.map((r) => {
          if (r.id === role.id) return { ...r, [field]: payload[field] };
          if (field === "isDefault" && Number(payload.isDefault) === 1) return { ...r, isDefault: 0 };
          return r;
        })
      );
      showToast("Cập nhật quyền thành công!", "success");
    } else {
      showToast(response?.message ?? "Cập nhật quyền thất bại. Vui lòng thử lại!", "error");
    }
    setUpdatingIds((prev) => prev.filter((id) => id !== role.id));
    setIsLoading(false);
  };

  // action nhóm
  // const handleDeleteMany = async () => {};
  // const handleDeleteAll = () => {};
  // const handleDeleteCurrentPage = () => {};

  const columns = [
    {
      key: "stt",
      title: "Số thứ tự",
      render: (_row: IRoleItem, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
      className: "w-1 text-center",
    },
    {
      key: "name",
      title: "Vai trò",
    },
    {
      key: "isDefault",
      title: "Quyền mặc định",
      render: (row: IRoleItem) => {
        const checked = Number(row.isDefault) === 1;
        const disabled = updatingIds.includes(row.id);
        return (
          <div className="mb-0 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={checked}
              disabled={disabled}
              onChange={() => handleTogglePermission(row, "isDefault")}
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}
            />
          </div>
        );
      },
    },
    {
      key: "isOperator",
      title: "Quyền điều hành",
      render: (row: IRoleItem) => {
        const checked = Number(row.isOperator) === 1;
        const disabled = updatingIds.includes(row.id);
        return (
          <div className="mb-0 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={checked}
              disabled={disabled}
              onChange={() => handleTogglePermission(row, "isOperator")}
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}
            />
          </div>
        );
      },
    },
  ];

  if (canView === null || canView === false) {
    return (
      <div className="main-wrapper">
        {!headerCollapsed && <Header />}
        <Sidebar />
        <div className="page-wrapper">
          <div className="content py-5 text-center">{canView === null ? <Loading /> : <ErrorPage505 />}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      {!headerCollapsed && <Header />}

      <Sidebar />

      <div className="page-wrapper">
        <div className="content pb-0">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Vai trò & Phân quyền
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={roleBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              {/* <BulkAction
                selectedCount={selectedRows.length}
                currentPageCount={listRoles.length}
                totalCount={pagination.totalItem}
                onDeleteAll={handleDeleteAll}
                onDeleteSelected={handleDeleteMany}
                onDeleteCurrentPage={handleDeleteCurrentPage}
              /> */}
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListRoles(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm vai trò" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              {!isLoading && listRoles?.length > 0 ? (
                <Table
                  id="roles_list"
                  data={listRoles}
                  columns={columns}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as IRoleItem }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as IRoleItem }) : undefined,
                    onPermission: canPermission ? (row) => navigate(`/permissions?roleId=${(row as IRoleItem).id}`) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as IRoleItem }) : undefined,
                  }}
                />
              ) : isLoading ? (
                <div className="text-center py-5">
                  <Loading />
                </div>
              ) : (
                <Fragment>
                  {isNoItem ? (
                    <div className="text-center py-5">
                      Hiện tại chưa có vai trò nào.
                      <br />
                      Hãy thêm mới vai trò đầu tiên nhé!
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      Không có dữ liệu trùng khớp.
                      <br />
                      Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                    </div>
                  )}
                </Fragment>
              )}
              <div className="mt-3">
                <Pagination
                  total={pagination.totalItem}
                  page={pagination.page}
                  perPage={pagination.limit}
                  onPageChange={pagination.setPage}
                  onPerPageChange={pagination.chooseLimit}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* Modal */}
      <ModalRole
        type={modal.type}
        shown={modalShown}
        item={modal.item as IRoleItem}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddRole : handleEditRole}
        onDelete={handleDeleteRole}
      />
    </div>
  );
}
