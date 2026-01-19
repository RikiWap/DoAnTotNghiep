import Dropdown from "react-bootstrap/Dropdown";
import "./Pagination.scss";

export type PaginationProps = {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  className?: string;
};

export default function Pagination({
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 30, 50],
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const startItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = total === 0 ? 0 : Math.min(total, page * perPage);

  // Tạo danh sách số trang hiển thị
  const displayNumber = 3; // số trang chính giữa, có thể customize
  const pages: (number | "...")[] = [];
  if (totalPages <= displayNumber + 2) {
    // Hiển thị hết
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Trang đầu
    pages.push(1);
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  // Xử lý chuyển trang
  function goto(p: number) {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    if (p !== page) onPageChange(p);
  }

  return (
    <div className={`pagination d-flex align-items-center justify-content-between flex-wrap ${className ?? ""}`}>
      {/* Hiển thị kết quả (tương tự file gốc) */}
      <div className="count-item">
        Hiển thị kết quả từ {startItem} - {endItem} trên tổng {total}
      </div>
      {/* Chọn số dòng/trang */}
      {/* <div className="d-flex align-items-center gap-2">
        <span>Hiển thị</span>
        <select
          className="form-select form-select-sm"
          value={perPage}
          onChange={(e) => onPerPageChange && onPerPageChange(Number(e.target.value))}
          style={{ width: 70 }}
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span>dòng/trang</span>
      </div> */}

      <div className="d-flex align-items-center gap-2">
        <span>Hiển thị</span>
        <Dropdown>
          <Dropdown.Toggle
            id="perpage-dropdown"
            size="sm"
            variant="light"
            style={{
              width: 70,
              border: "1px solid #e8e8e8",
              backgroundColor: "#fff",
              color: "#707070",
            }}
          >
            {perPage}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {perPageOptions.map((opt) => (
              <Dropdown.Item as="button" key={opt} active={opt === perPage} onClick={() => onPerPageChange?.(Number(opt))}>
                {opt}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <span>dòng/trang</span>
      </div>

      {/* Các nút chuyển trang */}
      <nav aria-label="Pagination">
        <ul className="dataTables_paginate pagination pagination-sm mb-0" id="pipeline-list_paginate">
          <li className={`paginate_button page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => goto(page - 1)} aria-label="Previous" type="button">
              &lt;
            </button>
          </li>
          {pages.map((p, i) =>
            p === "..." ? (
              <li key={`ellipsis-${i}`} className="paginate_button page-item disabled">
                <span className="page-link">…</span>
              </li>
            ) : (
              <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                <button
                  type="button"
                  onClick={() => goto(Number(p))}
                  className={`page-link${p === page ? " btn btn-primary text-white" : ""}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              </li>
            )
          )}
          <li className={`page-item cursor-pointer ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link next" onClick={() => goto(page + 1)} aria-label="Next" type="button">
              &gt;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
