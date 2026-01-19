import React, { useEffect } from "react";
import { toast } from "react-toastify";

/**
 * Hook: Redirect to /login if token is missing
 */
export function useRedirectIfNoToken(token: string) {
  useEffect(() => {
    if (!token) window.location.href = "/login";
  }, [token]);
}

/**
 * Hook: Fade show/hide modal effect
 */
export function useModalFade(modalType: "add" | "edit" | "delete" | "detail" | null, setModalShown: (v: boolean) => void) {
  useEffect(() => {
    if (modalType) {
      requestAnimationFrame(() => setModalShown(true));
    } else {
      setModalShown(false);
    }
  }, [modalType, setModalShown]);
}

/**
 * Type for modal state
 */
export type ModalState = { type: "add" | "edit" | "delete" | "detail" | null; item?: unknown };

/**
 * Hook: Close modal with fade out effect
 */
export function useCloseModal(setModalShown: (v: boolean) => void, setModal: (v: ModalState) => void) {
  return function closeModal() {
    setModalShown(false);
    setTimeout(() => setModal({ type: null }), 300);
  };
}

/**
 * Hiển thị thông báo toast
 * @param {string} msg - Nội dung thông báo
 * @param {'error' | 'success' | 'warning' | 'info'} type - Loại thông báo
 */
export const showToast = (msg: string, type: "error" | "success" | "warning" | "info" = "info") => {
  toast[type](msg, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

/**
 * Lấy cookie theo tên
 * Trả về chuỗi rỗng nếu không tồn tại
 */
export function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

/**
 * Delay thực thi (giúp chờ các tác vụ bất đồng bộ)
 */
export function runWithDelay<T>(fn: () => Promise<T>, delayMs: number = 1500): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      fn().then(resolve);
    }, delayMs);
  });
}

//format date time
export function formatDateTime(value?: string | Date) {
  if (!value) return "-";
  const d = new Date(value);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Render avatar image
export function renderAvatar(avatar?: string, name?: string) {
  if (!avatar) return React.createElement("span", null, "-");
  return React.createElement("img", {
    src: avatar,
    alt: name,
    style: {
      width: 60,
      height: 60,
      objectFit: "cover",
      borderRadius: "10%",
    },
  });
}

//Số thứ tự
export const renderIndex = (idx: number, page?: number, limit?: number) => (Number(page ?? 1) - 1) * Number(limit ?? 10) + idx + 1;

// Chuyển đổi giờ
export const toVietnamISOString = (dateString: string) => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  const vietnamTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return vietnamTime.toISOString();
};
