"use client";

import { useEffect, useState } from "react";

export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastHandler: ((toast: ToastData) => void) | null = null;

export function showToast(message: string, type: ToastData["type"] = "success") {
  if (toastHandler) {
    toastHandler({ id: Date.now().toString(), message, type });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    toastHandler = (toast: ToastData) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    return () => {
      toastHandler = null;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl shadow-card text-white font-medium text-sm animate-slide-up ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
