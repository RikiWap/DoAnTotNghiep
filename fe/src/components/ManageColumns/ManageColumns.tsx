import { useState, useRef, useEffect } from "react";

export interface ColumnOption {
  key: string;
  title: string;
  visible: boolean;
}

interface ManageColumnsProps {
  columns: ColumnOption[];
  onToggle: (key: string) => void;
}

export default function ManageColumns({ columns, onToggle }: ManageColumnsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <a
        href="#"
        className={`btn bg-soft-indigo px-2 border-0 ${isOpen ? "show" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <i className="ti ti-columns-3 me-2"></i>Quản lý cột
      </a>

      <div className={`dropdown-menu dropdown-menu-md dropdown-md p-3 ${isOpen ? "show" : ""}`} style={{ right: 0, left: "auto" }}>
        <h6 className="mb-2 border-bottom pb-2 fw-semibold">Cột hiển thị</h6>
        <ul className="list-unstyled mb-0">
          {columns.map((col) => (
            <li key={col.key} className="gap-1 d-flex align-items-center mb-2">
              <i className="ti ti-columns me-1 text-muted"></i>
              <div className="form-check form-switch w-100 ps-0">
                <label className="form-check-label d-flex align-items-center gap-2 w-100 cursor-pointer" htmlFor={`col-switch-${col.key}`}>
                  <span className="text-dark">{col.title}</span>
                  <input
                    className="form-check-input switchCheckDefault ms-auto"
                    type="checkbox"
                    role="switch"
                    id={`col-switch-${col.key}`}
                    checked={col.visible}
                    onChange={() => onToggle(col.key)}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
