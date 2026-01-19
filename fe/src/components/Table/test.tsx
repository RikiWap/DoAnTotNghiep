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
  const selectedIds = selectedRows?.map((row) => row.id) ?? [];
  const allSelected = selectable && data.length > 0 && data.every((row) => selectedIds.includes(row.id));
  const someSelected = selectable && data.some((row) => selectedIds.includes(row.id));

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
    if (selectedIds.includes(row.id)) {
      onSelect(selectedRows.filter((r) => r.id !== row.id));
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

  return (
    <div className={`table-responsive custom-table ${className ?? ""}`}>
      <table className="table table-nowrap" id={id}>
        <thead className="table-light">
          <tr>
            {selectable && (
              <th className="no-sort text-center align-middle">
                <div className="form-check form-check-md d-flex justify-content-center align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="select-all"
                    ref={headerCheckboxRef}
                    checked={allSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </th>
            )}
            {inferredColumns.map((col) => (
              <th key={col.key} className={`${col.className ? col.className + " " : ""}text-center align-middle`}>
                {col.title ?? humanize(col.key)}
              </th>
            ))}
            {actions && <th className="no-sort">{actions.label ?? "Action"}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            // decide row-level style if có trường color
            const colorKey = Object.keys(row).find((k) => /color$/i.test(k));
            const rowStyle: React.CSSProperties = {};
            const colorValue = colorKey ? (row[colorKey] as unknown) : undefined;
            if (typeof colorValue === "string" && colorValue) {
              rowStyle.backgroundColor = alphaColor(colorValue, 0.06);
            }

            return (
              <tr key={idx} style={rowStyle}>
                {selectable && (
                  <td className="text-center align-middle">
                    <div className="form-check form-check-md d-flex justify-content-center align-items-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectRow(row)}
                        id={`select-row-${row.id}`}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </td>
                )}
                {inferredColumns.map((col) => {
                  const value = row[col.key as keyof T] as unknown;
                  if (col.render) {
                    return (
                      <td key={col.key} className={`${col.className ? col.className + " " : ""}text-center align-middle`}>
                        <div className="d-flex justify-content-center align-items-center">{col.render(row, value, idx)}</div>
                      </td>
                    );
                  }

                  // nếu key chứa 'color' thì show badge màu
                  if (/color$/i.test(col.key) && typeof value === "string" && value) {
                    return (
                      <td key={col.key} className={`${col.className ? col.className + " " : ""}text-center align-middle`}>
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
                    <td key={col.key} className={`${col.className ? col.className + " " : ""}text-center align-middle`}>
                      <div className="d-flex justify-content-center align-items-center">{stringify(value)}</div>
                    </td>
                  );
                })}
                {actions && (
                  <td>
                    <Actions row={row} {...actions} />
                  </td>
                )}
              </tr>
            );
          })}

          {data.length === 0 && (
            <tr>
              <td colSpan={inferredColumns.length + (actions ? 1 : 0)} className="text-center py-4">
                No records found
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
