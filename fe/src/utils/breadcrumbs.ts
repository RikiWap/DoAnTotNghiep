export type BreadcrumbItem = {
  label: string;
  href?: string;
  active?: boolean;
};

export const homeBreadcrumb: BreadcrumbItem = { label: "Trang chủ", href: "/" };
export const branchBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Chi nhánh", active: true }];
export const userBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Danh sách người dùng", active: true }];
export const roleBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Vai trò", active: true }];
export const resourceBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Tài nguyên", active: true }];
export const permissionBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Phân quyền", active: true }];
export const customerBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Khách hàng", active: true }];
export const customerAttributeBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Thuộc tính khách hàng", active: true }];
export const dealBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Giao dịch", active: true }];
export const invoiceBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Hoá đơn", active: true }];
export const productBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Sản phẩm", active: true }];
export const serviceBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Dịch vụ", active: true }];
export const callHistoryBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Lịch sử cuộc gọi", active: true }];
export const leadReportBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Khách hàng tiềm năng", active: true }];
export const productReportBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Báo cáo Dịch vụ & Sản phẩm", active: true }];
export const pointHistoryBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Lịch sử điểm", active: true }];
export const scheduleBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Lịch hẹn", active: true }];
export const voucherBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Voucher", active: true }];
export const customerSourceBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Nguồn khách hàng", active: true }];
export const unitBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Đơn vị", active: true }];
export const profileBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Hồ sơ cá nhân", active: true }];
export const categoryBreadcrumbItems: BreadcrumbItem[] = [homeBreadcrumb, { label: "Danh mục", active: true }];

export function getBreadcrumbItems(...items: Array<Omit<BreadcrumbItem, "href"> & Partial<BreadcrumbItem>>) {
  return [homeBreadcrumb, ...items];
}
