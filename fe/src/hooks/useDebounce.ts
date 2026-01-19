import { useState, useEffect } from "react";

// Hook này nhận vào giá trị value và thời gian delay
// Nó chỉ trả về giá trị mới sau khi delay kết thúc
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Hẹn giờ update giá trị
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy hẹn giờ nếu value thay đổi hoặc component unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
