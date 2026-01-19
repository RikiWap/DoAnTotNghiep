import { useRef, useEffect, useState } from "react";

interface BulkActionProps {
  selectedCount: number;
  currentPageCount: number;
  totalCount: number;
  className?: string;
  onDeleteAll: () => void;
  onDeleteSelected: () => void;
  onDeleteCurrentPage: () => void;
}

export default function BulkAction({
  selectedCount,
  currentPageCount,
  totalCount,
  className,
  onDeleteAll,
  onDeleteSelected,
  onDeleteCurrentPage,
}: BulkActionProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className={className}>
      <div className="dropdown">
        <button
          ref={btnRef}
          className={`dropdown-toggle btn btn-outline-light px-2 shadow${open ? " active" : ""}`}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <i className="ti ti-trash me-2"></i>
          Thao tác nhóm
        </button>
        <div className={`dropdown-menu dropdown-menu-end${open ? " show" : ""}`} style={{ right: 0, left: "auto" }}>
          <ul className="list-unstyled mb-0">
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center justify-content-between"
                onClick={() => {
                  setOpen(false);
                  onDeleteAll();
                }}
                disabled={totalCount === 0}
              >
                <span>
                  <i className="ti ti-trash me-1"></i>
                  Xoá tất cả {totalCount} mục
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center justify-content-between"
                onClick={() => {
                  setOpen(false);
                  onDeleteCurrentPage();
                }}
                disabled={currentPageCount === 0}
              >
                <span>
                  <i className="ti ti-trash me-1"></i>
                  Xoá {currentPageCount} mục trên trang này
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item d-flex align-items-center justify-content-between"
                onClick={() => {
                  setOpen(false);
                  onDeleteSelected();
                }}
                disabled={selectedCount === 0}
              >
                <span>
                  <i className="ti ti-trash me-1"></i>
                  Xoá {selectedCount} mục đã chọn
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
