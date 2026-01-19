export type ColumnDef<T = Record<string, unknown>> = {
  key: string;
  title?: string;
  render?: (row: T, value: unknown, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
};

export type TableActionProps<T = Record<string, unknown>> = {
  row: T;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onPermission?: (row: T) => void;
  extra?: (row: T) => React.ReactNode;
};

export type TableProps<T = Record<string, unknown>> = {
  columns?: ColumnDef<T>[];
  data: T[];
  selectable?: boolean;
  onSelect?: (selected: T[]) => void;
  // actions props passed to table rows (row is injected by the table itself)
  // include optional `label` used in header display
  actions?: Omit<TableActionProps<T>, "row"> & { label?: string };
  className?: string;
  id?: string;
};
