/* eslint-disable react-hooks/exhaustive-deps */
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useState, useEffect, useRef, Fragment } from "react";
import { useRedirectIfNoToken, useModalFade, useCloseModal, renderIndex } from "../../utils/common";
import type { ModalState } from "../../utils/common";
import { showToast } from "../../utils/common";
import { getCookie } from "../../utils/common";
import { runWithDelay } from "../../utils/common";
import Table from "../../components/Table/Table";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { branchBreadcrumbItems } from "../../utils/breadcrumbs";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import Pagination from "../../components/Pagination/Pagination";
import BranchService from "../../services/BranchService";
import type { IBranchResponse } from "../../model/branch/BranchResponseModel";
import type { IBranchRequest, IBranchListRequest } from "../../model/branch/BranchRequestModel";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../components/Loading/Loading";
import ModalBranch from "./partials/ModalBranch";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import ManageColumns from "../../components/ManageColumns/ManageColumns";
// import ViewSwitcher from "../../components/ViewSwitcher/ViewSwitcher";

export default function Branch() {
  document.title = "Danh sách chi nhánh";

  const [listBranches, setListBranches] = useState<IBranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const [params, setParams] = useState<IBranchListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<IBranchResponse[]>([]);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const token = getCookie("token");

  const [canView, setCanView] = useState<boolean | null>(null);
  const [canAdd, setCanAdd] = useState<boolean | null>(null);
  const [canDelete, setCanDelete] = useState<boolean | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | null>(null);

  const abortController = useRef<AbortController | null>(null);
  const closeModal = useCloseModal(setModalShown, setModal);
  useRedirectIfNoToken(token);
  useModalFade(modal.type, setModalShown);

  useEffect(() => {
    const valView = localStorage.getItem("BRANCH_VIEW");
    const valAdd = localStorage.getItem("BRANCH_ADD");
    const valEdit = localStorage.getItem("BRANCH_UPDATE");
    const valDelete = localStorage.getItem("BRANCH_DELETE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanEdit(valEdit === "1");
    setCanDelete(valDelete === "1");
  }, []);

  const [columnDefs, setColumnDefs] = useState([
    { key: "stt", title: "STT", visible: true },
    { key: "name", title: "Tên chi nhánh", visible: true },
    { key: "address", title: "Địa chỉ", visible: true },
    { key: "phone", title: "Số điện thoại", visible: true },
    { key: "email", title: "Email", visible: true },
    { key: "website", title: "Website", visible: true },
    { key: "status", title: "Trạng thái", visible: true },
    { key: "created_time", title: "Ngày tạo", visible: true },
  ]);

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  // const handleSearch = (keyword: string) => {
  //   setParams((prev) => ({
  //     ...prev,
  //     keyword: keyword,
  //     page: 1,
  //   }));
  // };

  useEffect(() => {
    getListBranches(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListBranches = async (paramsSearch: IBranchListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => BranchService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListBranches(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddBranch = async (payload: IBranchRequest) => {
    setIsLoading(true);
    const response = await BranchService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm chi nhánh thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListBranches({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm chi nhánh thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditBranch = async (payload: IBranchRequest) => {
    setIsLoading(true);
    const response = await BranchService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật chi nhánh thành công!", "success");
      closeModal();
      await getListBranches(params);
    } else {
      showToast(response?.message ?? "Cập nhật chi nhánh thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteBranch = async () => {
    if (!modal.item) return;
    const branchItem = modal.item as IBranchResponse;
    setIsLoading(true);
    const response = await BranchService.delete(branchItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listBranches.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa chi nhánh thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListBranches({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa chi nhánh thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (branch: IBranchResponse) => {
    const prevBranches = [...listBranches];
    const newStatus = Number(branch.status) === 1 ? 0 : 1;

    setListBranches((prev) => prev.map((item) => (item.id === branch.id ? { ...item, status: newStatus } : item)));

    const response = await BranchService.updateStatus(branch.id, newStatus, token);
    if (response && response.code === 200) {
      showToast("Đổi trạng thái thành công!", "success");
      BranchService.list(params, token).then((res) => {
        if (res && res.code === 200) {
          setListBranches(res.result.items || []);
        }
      });
    } else {
      showToast(response?.message ?? "Đổi trạng thái thất bại. Vui lòng thử lại!", "error");
      setListBranches(prevBranches);
    }
  };

  const getVisibleColumns = () => {
    const columns = [
      {
        key: "stt",
        title: "Số thứ tự",
        className: "text-center w-1",
        render: (_row: IBranchResponse, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
      },
      // {
      //   key: "avatar",
      //   title: "Ảnh đại diện",
      //   render: (row: IBranchResponse) => renderAvatar(row.avatar, row.name),
      // },
      // {
      //   key: "name",
      //   title: "Tên chi nhánh",
      // },
      {
        key: "name",
        title: "Tên chi nhánh",
        render: (row: IBranchResponse) => (
          <div className="d-flex align-items-center">
            <div className="avatar avatar-sm rounded-circle border me-2">
              <img
                src={row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`}
                alt={row.name}
                className="w-100 h-100 object-fit-cover rounded-circle"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`;
                }}
              />
            </div>
            <span className="fs-14">{row.name}</span>
          </div>
        ),
      },
      {
        key: "address",
        title: "Địa chỉ",
      },
      {
        key: "phone",
        // className: "text-center",
        title: "Số điện thoại",
      },
      {
        key: "email",
        title: "Email",
      },
      {
        key: "website",
        title: "Website",
      },
      {
        key: "status",
        title: "Trạng thái",
        className: "text-center",
        render: (row: IBranchResponse) => (
          <span
            className={Number(row.status) === 1 ? "badge badge-soft-success" : "badge badge-soft-danger"}
            style={{ cursor: "pointer" }}
            onClick={() => handleToggleStatus(row)}
          >
            {Number(row.status) === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
          </span>
        ),
      },
      {
        key: "created_time",
        title: "Ngày tạo",
        className: "text-center",
        render: (row: IBranchResponse) => (row.createdTime ? new Date(row.createdTime).toLocaleDateString() : "-"),
      },
    ];

    return columns.filter((col) => {
      const def = columnDefs.find((c) => c.key === col.key);
      return def ? def.visible : true;
    });
  };

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
                Chi nhánh
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={branchBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListBranches(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              {/* <SearchBar placeholder="Tìm kiếm" onSearch={handleSearch} /> */}
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm chi nhánh" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap"></div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
                  {/* <ViewSwitcher/> */}
                </div>
              </div>
              {!isLoading && listBranches?.length > 0 ? (
                <Table
                  id="branch_list"
                  data={listBranches}
                  columns={getVisibleColumns()}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as IBranchResponse }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as IBranchResponse }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as IBranchResponse }) : undefined,
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
                      Hiện tại chưa có chi nhánh nào.
                      <br />
                      Hãy thêm mới chi nhánh đầu tiên nhé!
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
      <ModalBranch
        type={modal.type}
        shown={modalShown}
        item={modal.item as IBranchResponse}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddBranch : handleEditBranch}
        onDelete={handleDeleteBranch}
      />
    </div>
  );
}
