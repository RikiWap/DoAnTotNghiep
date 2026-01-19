/* eslint-disable react-hooks/exhaustive-deps */
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useState, useEffect, useRef, Fragment } from "react";
import { renderIndex, showToast, type ModalState } from "./../../utils/common";
import { getCookie } from "../../utils/common";
import { runWithDelay } from "../../utils/common";
import Table from "../../components/Table/Table";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { userBreadcrumbItems } from "../../utils/breadcrumbs";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import Pagination from "../../components/Pagination/Pagination";
import type { IUser } from "../../model/user/UserResponseModel";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../components/Loading/Loading";
import UserService from "../../services/UserService";
import type { IUserListRequest, IUserUpdateRequest } from "../../model/user/UserRequestModel";
import { useRedirectIfNoToken, useModalFade, useCloseModal } from "../../utils/common";
import ModalUser from "./partials/ModalUser";

export default function Users() {
  const [listUsers, setListUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const [params, setParams] = useState<IUserListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<IUser[]>([]);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const token = getCookie("token");

  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);

  useEffect(() => {
    getListUsers(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListUsers = async (paramsSearch: IUserListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => UserService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListUsers(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddUser = async (payload: IUserUpdateRequest) => {
    setIsLoading(true);
    const response = await UserService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm người dùng thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListUsers({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm người dùng thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditUser = async (payload: IUserUpdateRequest) => {
    setIsLoading(true);
    const response = await UserService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật người dùng thành công!", "success");
      closeModal();
      await getListUsers(params);
    } else {
      showToast(response?.message ?? "Cập nhật người dùng thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async () => {
    if (!modal.item) return;
    const userItem = modal.item as IUser;
    setIsLoading(true);
    const response = await UserService.delete(userItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listUsers.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa người dùng thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListUsers({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa người dùng thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (user: IUser) => {
    const prevUsers = [...listUsers];
    const newStatus = Number(user.active) === 1 ? 0 : 1;

    setListUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, active: newStatus } : item)));

    const response = await UserService.updateStatus(user.id, newStatus, token);
    if (response && response.code === 200) {
      showToast("Đổi trạng thái thành công!", "success");
      UserService.list(params, token).then((res) => {
        if (res && res.code === 200) {
          setListUsers(res.result.items || []);
        }
      });
    } else {
      showToast(response?.message ?? "Đổi trạng thái thất bại. Vui lòng thử lại!", "error");
      setListUsers(prevUsers);
    }
  };

  const columns = [
    {
      key: "stt",
      title: "Số thứ tự",
      render: (_row: IUser, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
      className: "w-1 text-center",
    },
    {
      key: "name",
      title: "Tên người dùng",
    },
    {
      key: "phone",
      title: "Số điện thoại",
    },
    {
      key: "email",
      title: "Email",
    },
    {
      key: "branchName",
      title: "Tên chi nhánh",
    },
    {
      key: "active",
      title: "Trạng thái",
      className: "text-center",
      render: (row: IUser) => (
        <span
          className={Number(row.active) === 1 ? "badge badge-soft-success" : "badge badge-soft-danger"}
          style={{ cursor: "pointer" }}
          onClick={() => handleToggleStatus(row)}
        >
          {Number(row.active) === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
        </span>
      ),
    },
    {
      key: "regisDate",
      title: "Ngày đăng ký",
      className: "text-center",
      render: (row: IUser) => (row.regisDate ? new Date(row.regisDate).toLocaleDateString() : "-"),
    },
  ];

  return (
    <div className="main-wrapper">
      {!headerCollapsed && <Header />}
      <Sidebar />
      <div className="page-wrapper">
        <div className="content pb-0">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
            <div>
              <h4 className="mb-1">
                Danh sách người dùng
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={userBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListUsers(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>
          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              <AddButton label="Thêm người dùng" onClick={() => setModal({ type: "add" })} />
            </div>
            <div className="card-body">
              {!isLoading && listUsers?.length > 0 ? (
                <Table
                  id="users_list"
                  data={listUsers}
                  columns={columns}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: (row) => setModal({ type: "edit", item: row as IUser }),
                    onDelete: (row) => setModal({ type: "delete", item: row as IUser }),
                    onView: (row) => setModal({ type: "detail", item: row as IUser }),
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
                      Hiện tại chưa có người dùng nào.
                      <br />
                      Hãy thêm mới người dùng đầu tiên nhé!
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
      <ModalUser
        type={modal.type ?? null}
        shown={modalShown}
        item={modal.item as IUser}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddUser : handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
