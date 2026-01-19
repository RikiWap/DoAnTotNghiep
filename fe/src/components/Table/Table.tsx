/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from "react";
import type { TableProps } from "./Table.types";
import type { ColumnDef } from "./Table.types";
import Actions from "./partials/Action";
import type { PaginationProps } from "../Pagination/Pagination";

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  actions,
  className,
  id,
  selectable = false,
  selectedRows = [],
  onSelect,
}: TableProps<T> & {
  paginationProps?: PaginationProps;
  selectable?: boolean;
  selectedRows?: T[];
  onSelect?: (rows: T[]) => void;
}) {
  // infer columns when not provided
  const inferredColumns: ColumnDef<T>[] = useMemo(() => {
    if (columns && columns.length) return columns;
    const keys = data.length ? (Object.keys(data[0]) as string[]) : [];
    return keys.map((k) => ({ key: k, title: humanize(k) }));
  }, [columns, data]);

  // Các id đã được chọn
  const selectedIds = selectedRows?.map((row) => (row as any).id) ?? [];
  const allSelected = selectable && data.length > 0 && data.every((row) => selectedIds.includes((row as any).id));
  const someSelected = selectable && data.some((row) => selectedIds.includes((row as any).id));

  // Ref cho checkbox header để set indeterminate
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = !allSelected && someSelected;
    }
  }, [allSelected, someSelected, data.length]);

  // Handler tick chọn từng dòng
  function handleSelectRow(row: T) {
    if (!onSelect) return;
    const rowId = (row as any).id;
    if (selectedIds.includes(rowId)) {
      onSelect(selectedRows.filter((r) => (r as any).id !== rowId));
    } else {
      onSelect([...selectedRows, row]);
    }
  }

  // Handler tick chọn tất cả
  function handleSelectAll() {
    if (!onSelect) return;
    if (allSelected) {
      onSelect([]);
    } else {
      onSelect([...data]);
    }
  }

  // Helper function để xác định alignment dựa trên className của cột
  const getAlignClass = (className?: string) => {
    if (!className) return "justify-content-start text-start";
    if (className.includes("text-center")) return "justify-content-center text-center";
    if (className.includes("text-end") || className.includes("text-right")) return "justify-content-end text-end";
    return "justify-content-start text-start";
  };

  return (
    <div className={`table-responsive custom-table ${className ?? ""}`}>
      <table className="table table-striped table-nowrap mb-0" id={id}>
        <thead className="table-light">
          <tr>
            {selectable && (
              <th className="no-sort text-center align-middle" style={{ width: 1 }}>
                <div className="form-check form-check-md d-flex justify-content-center align-items-center m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`${id ?? "table"}-select-all`}
                    ref={headerCheckboxRef}
                    checked={allSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </th>
            )}
            {inferredColumns.map((col) => (
              // Header giữ align-middle, bỏ text-center cứng
              <th key={col.key} className={`${col.className ? col.className + " " : ""}align-middle`}>
                {col.title ?? humanize(col.key)}
              </th>
            ))}
            {actions && <th className="no-sort text-center align-middle">{actions.label ?? "Action"}</th>}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => {
            const colorKey = Object.keys(row).find((k) => /color$/i.test(k));
            const rowStyle: React.CSSProperties = {};
            const colorValue = colorKey ? (row as any)[colorKey] : undefined;
            if (typeof colorValue === "string" && colorValue) {
              rowStyle.backgroundColor = alphaColor(colorValue, 0.06);
            }

            return (
              <tr key={(row as any).id ?? idx} style={rowStyle}>
                {selectable && (
                  <td className="text-center align-middle" style={{ width: 1 }}>
                    <div className="form-check form-check-md d-flex justify-content-center align-items-center m-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedIds.includes((row as any).id)}
                        onChange={() => handleSelectRow(row)}
                        id={`select-row-${(row as any).id ?? idx}`}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </td>
                )}

                {inferredColumns.map((col) => {
                  const value = (row as any)[col.key] as unknown;
                  // Xác định align cho nội dung
                  const alignClass = getAlignClass(col.className);

                  if (col.render) {
                    return (
                      <td key={col.key} className={`${col.className ? col.className + " " : ""}align-middle`}>
                        {/* Sử dụng alignClass thay vì fix cứng center */}
                        <div className={`d-flex align-items-center ${alignClass}`}>{col.render(row, value, idx)}</div>
                      </td>
                    );
                  }

                  if (/color$/i.test(col.key) && typeof value === "string" && value) {
                    return (
                      <td key={col.key} className={`${col.className ? col.className + " " : ""}align-middle`}>
                        {/* Cột màu sắc thì vẫn nên để center cho đẹp, hoặc tùy bạn */}
                        <div className="d-flex justify-content-center align-items-center">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: value,
                              color: readableTextColor(value),
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className={`${col.className ? col.className + " " : ""}align-middle`}>
                      <div className={`d-flex align-items-center ${alignClass}`}>{stringify(value)}</div>
                    </td>
                  );
                })}

                {actions && (
                  <td className="text-center align-middle">
                    <div className="d-flex justify-content-center align-items-center">
                      <Actions row={row} {...actions} />
                    </div>
                  </td>
                )}
              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan={inferredColumns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)} className="text-center py-4">
                Không tìm thấy bản ghi nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------
   Helpers giữ nguyên
   ---------------------- */
function humanize(str: string) {
  return String(str)
    .replace(/[_-]/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

function stringify(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const normalized =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function alphaColor(hex: string, alpha = 0.08) {
  try {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return hex;
  }
}

function readableTextColor(hex: string) {
  try {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#000" : "#fff";
  } catch {
    return "#fff";
  }
}
