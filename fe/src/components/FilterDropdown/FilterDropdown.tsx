import { useState, useRef, useEffect } from "react";

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterGroup {
  key: string;
  title: string;
  options: FilterOption[];
}

interface FilterDropdownProps {
  groups: FilterGroup[];
  onFilter: (selected: Record<string, (string | number)[]>) => void;
  onReset: () => void;
}

export default function FilterDropdown({ groups, onFilter, onReset }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(groups[0]?.key || null);

  const [selectedState, setSelectedState] = useState<Record<string, (string | number)[]>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (groupKey: string, value: string | number) => {
    setSelectedState((prev) => {
      const currentValues = prev[groupKey] || [];
      const exists = currentValues.includes(value);

      const newValues = exists ? currentValues.filter((v) => v !== value) : [...currentValues, value];

      return { ...prev, [groupKey]: newValues };
    });
  };

  const handleResetClick = () => {
    setSelectedState({});
    onReset();
    setIsOpen(false);
  };

  const handleFilterClick = () => {
    onFilter(selectedState);
    setIsOpen(false);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <a
        href="#"
        className={`btn btn-outline-light shadow px-2 ${isOpen ? "show" : ""}`}
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <i className="ti ti-filter me-2"></i>
        Filter
        <i className="ti ti-chevron-down ms-2"></i>
      </a>

      <div className={`filter-dropdown-menu dropdown-menu dropdown-menu-lg p-0 ${isOpen ? "show" : ""}`}>
        {/* Header */}
        <div className="filter-header d-flex align-items-center justify-content-between border-bottom">
          <h6 className="mb-0">
            <i className="ti ti-filter me-1"></i>Filter
          </h6>
          <button type="button" className="btn-close close-filter-btn" onClick={() => setIsOpen(false)} aria-label="Close"></button>
        </div>

        {/* Body */}
        <div className="filter-set-view p-3">
          <div className="accordion" id="accordionFilter">
            {groups.map((group) => (
              <div className="filter-set-content" key={group.key}>
                <div className="filter-set-content-head">
                  <a
                    href="#"
                    className={activeAccordion !== group.key ? "collapsed" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveAccordion(activeAccordion === group.key ? null : group.key);
                    }}
                    aria-expanded={activeAccordion === group.key}
                  >
                    {group.title}
                  </a>
                </div>

                <div className={`filter-set-contents accordion-collapse collapse ${activeAccordion === group.key ? "show" : ""}`}>
                  <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                    {/* Search input giả lập */}
                    <div className="mb-1">
                      <div className="input-icon-start input-icon position-relative">
                        <span className="input-icon-addon fs-12">
                          <i className="ti ti-search"></i>
                        </span>
                        <input type="text" className="form-control form-control-md" placeholder="Search" />
                      </div>
                    </div>

                    {/* List checkboxes */}
                    <ul>
                      {group.options.map((option) => {
                        const isChecked = (selectedState[group.key] || []).includes(option.value);
                        return (
                          <li key={option.value}>
                            <label className="dropdown-item px-2 d-flex align-items-center cursor-pointer">
                              <input
                                className="form-check-input m-0 me-1"
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(group.key, option.value)}
                              />
                              {option.label}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="d-flex align-items-center gap-2 mt-3">
            <a
              href="#"
              className="btn btn-outline-light w-100"
              onClick={(e) => {
                e.preventDefault();
                handleResetClick();
              }}
            >
              Reset
            </a>

            <a
              href="#"
              className="btn btn-primary w-100"
              onClick={(e) => {
                e.preventDefault();
                handleFilterClick();
              }}
            >
              Filter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
