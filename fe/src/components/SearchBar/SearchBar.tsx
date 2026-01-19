import { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";

type Props = {
  placeholder?: string;
  onSearch?: (q: string) => void;
  className?: string;
  minWidth?: number | string;
};

export default function SearchBar({ placeholder = "Search", onSearch, className, minWidth }: Props) {
  const [localKeyword, setLocalKeyword] = useState("");
  const debouncedKeyword = useDebounce(localKeyword, 500);

  useEffect(() => {
    onSearch?.(debouncedKeyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  return (
    <div className={className} style={{ minWidth: minWidth ?? 240 }}>
      <div className="input-icon input-icon-start position-relative w-100">
        <span className="input-icon-addon text-dark">
          <i className="ti ti-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
        />
      </div>
    </div>
  );
}
