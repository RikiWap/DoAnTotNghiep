/* eslint-disable react-hooks/exhaustive-deps */
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Footer from "../../components/Footer/Footer";
import { useState, useEffect, useRef, Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import { showToast } from "./../../utils/common";
import { getCookie } from "../../utils/common";
import { runWithDelay } from "../../utils/common";
import Table from "../../components/Table/Table";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { permissionBreadcrumbItems } from "../../utils/breadcrumbs";
import ExportButton from "../../components/ExportButton/ExportButton";
import RefreshButton from "../../components/RefreshButton/RefreshButton";
import CollapseButton from "../../components/CollapseButton/CollapseButton";
import SearchBar from "../../components/SearchBar/SearchBar";
import Pagination from "../../components/Pagination/Pagination";
import type { IResourcePermissionItem } from "../../model/permissions/PermissionResponseModel";
import type { ColumnDef } from "../../components/Table/Table.types";
import type { IPermissionUpdateRequest } from "../../model/permissions/PermissionRequestModel";
import Loading from "../../components/Loading/Loading";
import PermissionService from "../../services/PermissionService";
import { useRedirectIfNoToken } from "../../utils/common";

export default function Permission() {
  type RowType = IResourcePermissionItem & Record<string, unknown>;
  const [listResource, setListResource] = useState<IResourcePermissionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selectedRows, setSelectedRows] = useState<RowType[]>([]);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const token = getCookie("token");
  const [searchParams] = useSearchParams();
  const roleId = Number(searchParams.get("roleId") ?? 0);

  const abortController = useRef<AbortController | null>(null);

  useRedirectIfNoToken(token);

  useEffect(() => {
    getResourcePermission();
    return () => abortController.current?.abort();
  }, [roleId, token]);

  const getResourcePermission = async () => {
    setIsLoading(true);

    abortController.current = new AbortController();
    const response = await runWithDelay(() => PermissionService.info({ roleId }, token, abortController.current?.signal), 500);
    if (response && response.code === 200) {
      setListResource(response.result || []);
      setIsNoItem((response.result?.length ?? 0) === 0);
      setPage(1);
    } else {
      showToast(response?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  // Lấy tất cả action có trong listResource
  const allActions = Array.from(
    new Set(
      listResource.flatMap((r) => {
        try {
          const parsed = JSON.parse(r.actions || "[]");
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })
    )
  );

  // Tạo columns động theo actions từng resource
  const dynamicActionColumns: ColumnDef<RowType>[] = allActions.map((action) => ({
    key: action,
    title: `Quyền ${action}`,
    className: "text-center",
    render: (row: RowType) => {
      let currentActions: string[] = [];
      if (row.permission.actions) {
        try {
          const parsed = JSON.parse(row.permission.actions);
          currentActions = Array.isArray(parsed) ? parsed : [];
        } catch {
          currentActions = [];
        }
      }
      // Chỉ render tick nếu resource này có quyền action
      let availableActions: string[] = [];
      if (row.actions) {
        try {
          const parsed = JSON.parse(row.actions);
          availableActions = Array.isArray(parsed) ? parsed : [];
        } catch {
          availableActions = [];
        }
      }
      if (!availableActions.includes(action)) return null; // Không render nếu không có quyền này

      const checked = currentActions.includes(action);
      return (
        <div className="mb-0 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={checked}
            onChange={(e) => handleToggleAction(row, action, e.target.checked)}
            style={{ cursor: "pointer" }}
          />
        </div>
      );
    },
  }));

  // Xử lý tích/bỏ quyền
  const handleToggleAction = async (resource: IResourcePermissionItem, action: string, checked: boolean) => {
    const payload: IPermissionUpdateRequest = {
      roleId,
      resourceId: resource.id,
      actions: JSON.stringify([action]),
    };

    if (checked) {
      const response = await PermissionService.add(payload, token);
      if (response && response.code === 200) {
        showToast("Thêm quyền thành công!", "success");
        setListResource((prev) =>
          prev.map((r) => {
            if (r.id !== resource.id) return r;
            let currentActions: string[] = [];
            try {
              const parsed = JSON.parse(r.permission.actions || "[]");
              if (Array.isArray(parsed)) currentActions = parsed;
            } catch {
              currentActions = [];
            }
            if (!currentActions.includes(action)) currentActions.push(action);
            return {
              ...r,
              permission: {
                ...r.permission,
                actions: JSON.stringify(currentActions),
              },
            } as IResourcePermissionItem;
          })
        );
      } else {
        showToast(response?.message ?? "Thêm quyền thất bại!", "error");
      }
    } else {
      const response = await PermissionService.remove(payload, token);
      if (response && response.code === 200) {
        showToast("Bỏ quyền thành công!", "success");
        setListResource((prev) =>
          prev.map((r) => {
            if (r.id !== resource.id) return r;
            let currentActions: string[] = [];
            try {
              const parsed = JSON.parse(r.permission.actions || "[]");
              if (Array.isArray(parsed)) currentActions = parsed;
            } catch {
              currentActions = [];
            }
            const updated = currentActions.filter((a) => a !== action);
            return {
              ...r,
              permission: {
                ...r.permission,
                actions: JSON.stringify(updated),
              },
            } as IResourcePermissionItem;
          })
        );
      } else {
        showToast(response?.message ?? "Bỏ quyền thất bại!", "error");
      }
    }
    setIsLoading(false);
  };

  // Xử lý tích/bỏ tất cả quyền trên resource
  const handleToggleAllActions = async (resource: IResourcePermissionItem, checked: boolean) => {
    let allActions: string[] = [];
    if (resource.actions) {
      const parsed = JSON.parse(resource.actions);
      if (Array.isArray(parsed)) {
        allActions = parsed;
      } else {
        allActions = [];
      }
    } else {
      allActions = [];
    }
    const payload: IPermissionUpdateRequest = {
      roleId,
      resourceId: resource.id,
      actions: JSON.stringify(allActions),
    };
    const serviceFn = checked ? PermissionService.add : PermissionService.remove;
    const response = await serviceFn(payload, token);
    if (response && response.code === 200) {
      showToast(`${checked ? "Thêm" : "Bỏ"} tất cả quyền thành công!`, "success");
      setListResource((prev) =>
        prev.map((r) => {
          if (r.id !== resource.id) return r;
          return {
            ...r,
            permission: {
              ...r.permission,
              actions: JSON.stringify(checked ? allActions : []),
            },
          } as IResourcePermissionItem;
        })
      );
    } else {
      showToast(response?.message ?? "Thao tác thất bại!", "error");
    }
    setIsLoading(false);
  };

  // Table columns
  const columns: ColumnDef<RowType>[] = [
    {
      key: "name",
      title: "Tên tài nguyên",
    },
    {
      key: "code",
      title: "Mã tài nguyên",
    },
    ...dynamicActionColumns,
    {
      key: "all",
      title: "Tất cả",
      className: "text-center",
      render: (row: RowType, _value: unknown, _idx: number) => {
        void _value;
        void _idx;
        let currentActions: string[] = [];
        let allActions: string[] = [];
        if (row.permission.actions) {
          const parsed = JSON.parse(row.permission.actions);
          if (Array.isArray(parsed)) {
            currentActions = parsed;
          } else {
            currentActions = [];
          }
        } else {
          currentActions = [];
        }
        if (row.actions) {
          const parsed = JSON.parse(row.actions);
          if (Array.isArray(parsed)) {
            allActions = parsed;
          } else {
            allActions = [];
          }
        } else {
          allActions = [];
        }
        const checked = allActions.length > 0 && allActions.every((action) => currentActions.includes(action));
        return (
          <div className="mb-0 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={checked}
              onChange={(e) => handleToggleAllActions(row, e.target.checked)}
              style={{ cursor: "pointer" }}
            />
          </div>
        );
      },
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
                Phân quyền
                <span className="badge badge-soft-primary ms-2">{listResource.length}</span>
              </h4>
              <Breadcrumb items={permissionBreadcrumbItems} />
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
              <ExportButton onExport={() => {}} />
              <RefreshButton onRefresh={() => getResourcePermission()} />
              <CollapseButton onCollapse={() => setHeaderCollapsed((v) => !v)} active={headerCollapsed} />
            </div>
          </div>

          <div className="card border-0 rounded-0">
            <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
              <SearchBar placeholder="Tìm kiếm" />
            </div>

            <div className="card-body">
              {!isLoading && listResource?.length > 0 ? (
                <Table<RowType>
                  id="permissions_list"
                  data={listResource.slice((page - 1) * limit, page * limit) as unknown as RowType[]}
                  columns={columns}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelect={(rows) => setSelectedRows(rows as RowType[])}
                />
              ) : isLoading ? (
                <div className="text-center py-5">
                  <Loading />
                </div>
              ) : (
                <Fragment>
                  {isNoItem ? (
                    <div className="text-center py-5">
                      Hiện tại chưa có dữ liệu nào.
                      <br />
                      Hãy thêm mới dữ liệu đầu tiên nhé!
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
                  total={listResource.length}
                  page={page}
                  perPage={limit}
                  onPageChange={(p: number) => setPage(p)}
                  onPerPageChange={(l: number) => {
                    setLimit(l);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
