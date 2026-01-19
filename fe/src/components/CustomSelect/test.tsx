/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Select from "react-select";
import type { Props as ReactSelectProps } from "react-select";

type DefaultOption = {
  id?: number | string;
  name?: string;
  [key: string]: any;
};

// Generic: T extends DefaultOption
export type CustomSelectProps<T extends DefaultOption = DefaultOption> = {
  value: T | null;
  options: T[];
  onChange: (option: T | null) => void;
  isDisabled?: boolean;
  placeholder?: string;
  // allow passing other react-select props (e.g., isClearable, isSearchable, isMulti if you adapt)
} & Omit<ReactSelectProps<T, false>, "value" | "options" | "onChange" | "placeholder" | "isDisabled">;

function CustomSelectInner<T extends DefaultOption = DefaultOption>({
  value,
  options,
  onChange,
  isDisabled,
  placeholder,
  theme,
  styles,
  ...rest
}: CustomSelectProps<T>) {
  // SSR guard for menuPortalTarget
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <Select<T, false>
      value={value}
      onChange={(opt) => {
        // opt can be null or an option when single-select
        onChange((opt as T) ?? null);
      }}
      options={options}
      // default label/value getters - if your options shape differs, pass custom getters via rest props
      getOptionLabel={(option: any) => option?.name ?? String(option)}
      getOptionValue={(option: any) => String(option?.id ?? option)}
      placeholder={placeholder || "Chọn"}
      isDisabled={isDisabled}
      menuPortalTarget={portalTarget}
      theme={(baseTheme) => ({
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          primary: "#dc3545",
          primary25: "#f8d7da",
          danger: "#dc3545",
          dangerLight: "#f8d7da",
        },
        ...(typeof theme === "function" ? theme(baseTheme) : ((theme as any) ?? {})),
      })}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 20000 }),
        menu: (base) => ({
          ...base,
          zIndex: 20000,
          maxHeight: 200,
          overflowY: "auto",
        }),
        menuList: (base) => ({
          ...base,
          maxHeight: 200,
          overflowY: "auto",
        }),
        placeholder: (base) => ({
          ...base,
          fontSize: 14,
        }),
        option: (base) => ({
          ...base,
          fontSize: 14,
        }),
        control: (base, state) => ({
          ...base,
          boxShadow: "0px 4px 4px 0px rgba(219, 219, 219, 0.25)",
          border: `${state.isFocused ? "1.6px" : "1.2px"} solid ${state.isFocused ? "#dc3545" : "#e8e8e8"}`,
          lineHeight: "1.5",
          borderRadius: "0.375rem",
          padding: "0.6px 0px",
        }),
        singleValue: (base) => ({
          ...base,
          fontSize: 14,
          color: "#707070",
        }),
        ...(styles as any),
      }}
      {...(rest as any)}
    />
  );
}

// export memoized component
const CustomSelect = React.memo(CustomSelectInner) as typeof CustomSelectInner;
export default CustomSelect;
