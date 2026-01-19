import { Link, useLocation } from "react-router-dom";

export default function ViewSwitcher() {
  const location = useLocation();
  const currentPath = location.pathname;

  // 1. Xác định xem đang ở chế độ Grid hay không dựa vào đuôi "-grid"
  const isGridActive = currentPath.endsWith("-grid");

  // 2. Tính toán đường dẫn cho 2 nút
  let listViewPath = "";
  let gridViewPath = "";

  if (isGridActive) {
    // Nếu đang ở Grid (/customers-grid) -> List view sẽ là cắt bỏ đuôi "-grid"
    gridViewPath = currentPath;
    listViewPath = currentPath.replace("-grid", "");
  } else {
    // Nếu đang ở List (/customers) -> Grid view sẽ là thêm đuôi "-grid"
    listViewPath = currentPath;
    gridViewPath = `${currentPath}-grid`;
  }

  return (
    <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
      <Link to={listViewPath} className={`btn btn-sm p-1 border-0 fs-14 ${!isGridActive ? "active" : ""}`}>
        <i className="ti ti-list-tree"></i>
      </Link>

      <Link to={gridViewPath} className={`flex-shrink-0 btn btn-sm p-1 border-0 ms-1 fs-14 ${isGridActive ? "active" : ""}`}>
        <i className="ti ti-grid-dots"></i>
      </Link>
    </div>
  );
}
