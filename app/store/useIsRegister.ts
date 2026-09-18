// store.ts
import { create } from "zustand";

interface AppState {
  isRegister: boolean;
  setIsRegister: (register: boolean) => void;
}

export const useIsRegister = create<AppState>((set) => ({
  // 初始化的值
  isRegister: true,
  setIsRegister: (register: boolean) => {
    return set({ isRegister: register });
  },
}));

export default useIsRegister;
