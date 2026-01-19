/* eslint-disable @typescript-eslint/no-explicit-any */
import Select from "react-select";

type CustomSelectProps = {
  value: any;
  options: any[];
  onChange: (option: any) => void;
  isDisabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  isClearable?: boolean;
};

export default function CustomSelect({ value, options, onChange, isDisabled, placeholder, isLoading }: CustomSelectProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => String(option.id)}
      placeholder={placeholder || "Chọn"}
      isDisabled={isDisabled}
      isLoading={isLoading}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      menuPlacement="auto"
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: "#dc3545",
          primary25: "#f8d7da",
          danger: "#dc3545",
          dangerLight: "#f8d7da",
        },
      })}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 20000 }),
        menu: (base) => ({
          ...base,
          zIndex: 20000,
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
        multiValueLabel: (base) => ({
          ...base,
          fontSize: 14,
          color: "#707070",
        }),
        input: (base) => ({
          ...base,
          fontSize: 14,
          lineHeight: "1.4",
          color: "#707070",
        }),
        noOptionsMessage: (base) => ({
          ...base,
          fontSize: 14,
        }),
      }}
      noOptionsMessage={({ inputValue }) => (inputValue ? `Không tìm thấy "${inputValue}"` : "Không có lựa chọn")}
    />
  );
}
