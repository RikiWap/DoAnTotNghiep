export type BreadcrumbItem = {
  label: string;
  href?: string;
  active?: boolean;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumb({ items, className }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="breadcrumb mb-0 p-0">
        {items.map((b, i) => (
          <li
            key={i}
            className={`breadcrumb-item${b.active ? ' active' : ''}`}
            aria-current={b.active ? 'page' : undefined}
          >
            {b.href && !b.active ? <a href={b.href}>{b.label}</a> : b.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}
