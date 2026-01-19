/* eslint-disable react-hooks/exhaustive-deps */
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useState, useEffect, useRef, Fragment } from "react";
import { renderIndex, showToast } from "./../../utils/common";
import { getCookie } from "../../utils/common";
import { runWithDelay } from "../../utils/common";
import Table from "../../components/Table/Table";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { unitBreadcrumbItems } from "../../utils/breadcrumbs";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import AddButton from "../../components/AddButton/AddButton";
import Pagination from "../../components/Pagination/Pagination";
import { usePagination } from "../../hooks/usePagination";
import Loading from "../../components/Loading/Loading";
import ErrorPage505 from "../ErrorPage505/ErrorPage505";
import { useRedirectIfNoToken, useModalFade, useCloseModal } from "../../utils/common";
import type { ModalState } from "../../utils/common";
import ModalUnit from "./partials/ModalUnit";
import type { IUnitItem } from "../../model/unit/UnitResponseModel";
import type { IUnitListRequest, IUnitRequest } from "../../model/unit/UnitRequestModel";
import UnitService from "../../services/UnitService";
import ManageColumns from "../../components/ManageColumns/ManageColumns";

export default function Unit() {
  document.title = "Danh sách đơn vị";
  const [listUnit, setListUnit] = useState<IUnitItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [modalShown, setModalShown] = useState(false);
  const [params, setParams] = useState<IUnitListRequest>({ page: 1, limit: 10, keyword: "" });
  const pagination = usePagination(params, setParams);
  const [selectedRows, setSelectedRows] = useState<IUnitItem[]>([]);
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

  const [columnDefs, setColumnDefs] = useState([
    { key: "stt", title: "STT", visible: true },
    { key: "name", title: "Tên đơn vị", visible: true },
    { key: "status", title: "Trạng thái", visible: true },
  ]);

  const handleToggleColumn = (key: string) => {
    setColumnDefs((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  useEffect(() => {
    const valView = localStorage.getItem("UNIT_VIEW");
    const valAdd = localStorage.getItem("UNIT_ADD");
    const valDelete = localStorage.getItem("UNIT_DELETE");
    const valEdit = localStorage.getItem("UNIT_UPDATE");
    setCanView(valView === "1");
    setCanAdd(valAdd === "1");
    setCanDelete(valDelete === "1");
    setCanEdit(valEdit === "1");
  }, []);

  useEffect(() => {
    getListUnits(params);
    return () => abortController.current?.abort();
  }, [params]);

  const getListUnits = async (paramsSearch: IUnitListRequest) => {
    setIsLoading(true);
    abortController.current = new AbortController();
    const response = await runWithDelay(() => UnitService.list(paramsSearch, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      const result = response.result;
      setListUnit(result.items || []);
      pagination.updatePagination(result.total ?? 0, result.page ?? params.page, params.limit);
      setIsNoItem((Number(result.total ?? 0) || 0) === 0 && (Number(result.page ?? paramsSearch.page) || 1) === 1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleAddUnit = async (payload: IUnitListRequest) => {
    setIsLoading(true);
    const response = await UnitService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Thêm đơn vị thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: 1 }));
      await getListUnits({ ...params, page: 1 });
    } else {
      showToast(response?.message ?? "Thêm đơn vị thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleEditUnit = async (payload: IUnitRequest) => {
    setIsLoading(true);
    const response = await UnitService.update(payload, token);
    if (response && response.code === 200) {
      showToast("Cập nhật đơn vị thành công!", "success");
      closeModal();
      await getListUnits(params);
    } else {
      showToast(response?.message ?? "Cập nhật đơn vị thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const handleDeleteUnit = async () => {
    if (!modal.item) return;
    const unitItem = modal.item as IUnitItem;
    setIsLoading(true);
    const response = await UnitService.delete(unitItem.id, token);
    const safePage = params.page ?? 1;
    const newPage = listUnit.length === 1 && safePage > 1 ? safePage - 1 : safePage;
    if (response && response.code === 200) {
      showToast("Xóa đơn vị thành công!", "success");
      closeModal();
      setParams((prev) => ({ ...prev, page: newPage }));
      await getListUnits({ ...params, page: newPage });
    } else {
      showToast(response?.message ?? "Xóa đơn vị thất bại. Vui lòng thử lại!", "error");
    }
    setIsLoading(false);
  };

  const getVisibleColumns = () => {
    const columns = [
      {
        key: "stt",
        title: "Số thứ tự",
        render: (_row: IUnitItem, _value: unknown, idx: number) => renderIndex(idx, pagination.page, pagination.limit),
        className: "text-center w-1",
      },
      {
        key: "name",
        title: "Tên đơn vị",
      },
      {
        key: "status",
        title: "Trạng thái",
        className: "text-center",
        render: (row: IUnitItem) => (
          <span className={Number(row.status) === 1 ? "badge badge-soft-success" : "badge badge-soft-danger"}>
            {Number(row.status) === 1 ? "Đang hoạt động" : "Ngưng hoạt động"}
          </span>
        ),
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
                Đơn vị
                <span className="badge badge-soft-primary ms-2">{pagination.totalItem}</span>
              </h4>
              <Breadcrumb items={unitBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getListUnits(params)} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" onSearch={(kw) => setParams((prev) => ({ ...prev, keyword: kw, page: 1 }))} />
              {canAdd && <AddButton label="Thêm đơn vị" onClick={() => setModal({ type: "add" })} />}
            </div>

            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap"></div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <ManageColumns columns={columnDefs} onToggle={handleToggleColumn} />
                  {/* <ViewSwitcher/> */}
                </div>
              </div>
              {!isLoading && listUnit?.length > 0 ? (
                <Table
                  id="units_list"
                  data={listUnit}
                  columns={getVisibleColumns()}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={setSelectedRows}
                  actions={{
                    label: "Thao tác",
                    onEdit: canEdit ? (row) => setModal({ type: "edit", item: row as IUnitItem }) : undefined,
                    onDelete: canDelete ? (row) => setModal({ type: "delete", item: row as IUnitItem }) : undefined,
                    onView: canView ? (row) => setModal({ type: "detail", item: row as IUnitItem }) : undefined,
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
                      Hiện tại chưa có đơn vị nào.
                      <br />
                      Hãy thêm mới đơn vị đầu tiên nhé!
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
      <ModalUnit
        type={modal.type}
        shown={modalShown}
        item={modal.item as IUnitItem}
        onClose={closeModal}
        onSubmit={modal.type === "add" ? handleAddUnit : handleEditUnit}
        onDelete={handleDeleteUnit}
      />
    </div>
  );
}
