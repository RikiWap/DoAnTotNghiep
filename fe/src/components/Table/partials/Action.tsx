import { useEffect, useRef } from "react";
import type { TableActionProps } from "../Table.types";
import { Tooltip } from "bootstrap";

export default function ActionsTable<T extends Record<string, unknown>>({ row, onEdit, onDelete, onView, onPermission, extra }: TableActionProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll<HTMLElement>("[data-bs-toggle='tooltip']");
    const tooltips = Array.from(nodes).map((el) => new Tooltip(el));
    return () => tooltips.forEach((t) => t.dispose());
  }, [onEdit, onDelete, onView, onPermission, extra]);

  return (
    <div className="d-flex gap-2" ref={containerRef}>
      {onEdit && (
        <button className="btn btn-sm btn-light" onClick={() => onEdit(row)} data-bs-toggle="tooltip" data-bs-placement="top" title="Chỉnh sửa">
          <i className="ti ti-edit"></i>
        </button>
      )}
      {onDelete && (
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(row)} data-bs-toggle="tooltip" data-bs-placement="top" title="Xóa">
          <i className="ti ti-trash"></i>
        </button>
      )}
      {onView && (
        <button className="btn btn-sm btn-info" onClick={() => onView(row)} data-bs-toggle="tooltip" data-bs-placement="top" title="Xem chi tiết">
          <i className="ti ti-eye"></i>
        </button>
      )}
      {onPermission && (
        <button
          className="btn btn-sm btn-warning"
          onClick={() => onPermission(row)}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Phân quyền"
        >
          <i className="ti ti-shield"></i>
        </button>
      )}
      {extra && extra(row)}
    </div>
  );
}
