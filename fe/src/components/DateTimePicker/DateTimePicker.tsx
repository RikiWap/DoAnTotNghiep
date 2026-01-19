import React, { forwardRef, useEffect, useRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimePicker.scss";
import { parseISO, format } from "date-fns";
import { vi } from "date-fns/locale/vi";

registerLocale("vi", vi);

type Props = {
  value?: string;
  onChange: (isoDate: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  name?: string;
  maxDate?: Date;
  id?: string;
  className?: string;
  yearStart?: number;
  yearEnd?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, disabled }, ref) => {
  return (
    <div className="input-group picker-custom-input">
      <input
        ref={ref}
        type="text"
        className="form-control"
        onClick={onClick}
        value={value || ""}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
      />
      <span className="input-group-text picker-icon" onClick={onClick} style={{ cursor: "pointer" }}>
        <i className="ti ti-calendar"></i>
      </span>
    </div>
  );
});
CustomInput.displayName = "CustomInput";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomHeader(props: any) {
  const { date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled, yearStart, yearEnd } = props;

  const months = Array.from({ length: 12 }).map((_, m) => format(new Date(date.getFullYear(), m, 1), "LLLL", { locale: vi }));

  const currentYear = new Date().getFullYear();
  const startY = yearStart ?? 1900;
  const endY = yearEnd ?? currentYear;
  const years = Array.from({ length: endY - startY + 1 }, (_, i) => startY + i);

  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpenMonth(false);
        setOpenYear(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="d-flex align-items-center justify-content-between custom-header" ref={wrapperRef}>
      <button
        type="button"
        className="btn btn-link p-0 me-2 nav-btn"
        onMouseDown={(e) => {
          stop(e);
          decreaseMonth();
        }}
        disabled={prevMonthButtonDisabled}
        aria-label="Previous Month"
      >
        <i className="ti ti-chevron-left"></i>
      </button>

      <div className="d-flex gap-2 align-items-center header-selects">
        <div className="picker-dropdown">
          <button
            type="button"
            className="picker-dropdown-toggle"
            onMouseDown={(e) => stop(e)}
            onClick={() => setOpenMonth((s) => !s)}
            aria-haspopup="listbox"
            aria-expanded={openMonth}
          >
            {months[date.getMonth()]}
            <i className="ti ti-chevron-down dropdown-caret"></i>
          </button>

          {openMonth && (
            <div className="picker-dropdown-menu" role="listbox" aria-label="Chọn tháng" onMouseDown={(e) => stop(e)}>
              {months.map((mName, idx) => (
                <button
                  key={mName}
                  type="button"
                  className={`picker-dropdown-item ${idx === date.getMonth() ? "active" : ""}`}
                  onClick={() => {
                    changeMonth(idx);
                    setOpenMonth(false);
                  }}
                >
                  {mName}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="picker-dropdown">
          <button
            type="button"
            className="picker-dropdown-toggle"
            onMouseDown={(e) => stop(e)}
            onClick={() => setOpenYear((s) => !s)}
            aria-haspopup="listbox"
            aria-expanded={openYear}
          >
            {date.getFullYear()}
            <i className="ti ti-chevron-down ms-2 dropdown-caret"></i>
          </button>

          {openYear && (
            <div className="picker-dropdown-menu picker-dropdown-menu--years" role="listbox" aria-label="Chọn năm" onMouseDown={(e) => stop(e)}>
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={`picker-dropdown-item ${y === date.getFullYear() ? "active" : ""}`}
                  onClick={() => {
                    changeYear(y);
                    setOpenYear(false);
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-link p-0 ms-2 nav-btn"
        onMouseDown={(e) => {
          stop(e);
          increaseMonth();
        }}
        disabled={nextMonthButtonDisabled}
        aria-label="Next Month"
      >
        <i className="ti ti-chevron-right"></i>
      </button>
    </div>
  );
}

export default function PickerDateTime({
  value,
  onChange,
  readOnly = false,
  placeholder,
  name,
  maxDate,
  id,
  className,
  yearStart = 1900,
  yearEnd,
}: Props) {
  // parse input
  let selected: Date | null = null;
  try {
    selected = value ? parseISO(value) : null;
    if (selected && Number.isNaN(selected.getTime())) selected = null;
  } catch {
    selected = null;
  }

  const handleChange = (date: Date | null) => {
    if (!date) {
      onChange("");
      return;
    }
    onChange(format(date, "yyyy-MM-dd'T'00:00:00"));
  };

  return (
    <div className={className}>
      <DatePicker
        id={id}
        selected={selected}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        maxDate={maxDate || new Date()}
        showMonthDropdown={false}
        showYearDropdown={false}
        disabled={readOnly}
        customInput={<CustomInput />}
        calendarClassName="custom-datepicker-calendar"
        popperClassName="custom-datepicker-popper"
        locale="vi"
        renderCustomHeader={(headerProps) => <CustomHeader {...headerProps} yearStart={yearStart} yearEnd={yearEnd} />}
      />
      {name && <input type="hidden" name={name} value={value || ""} />}
    </div>
  );
}
