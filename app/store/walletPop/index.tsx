// 引入 zustand 库，用于创建全局状态管理
import { create } from 'zustand';

// 定义应用状态的接口，包括一个布尔值和一个更新该值的方法
interface AppState {
    openWallet: boolean; // 表示钱包弹窗是否打开
    setOpenWallet: (openWallet?: boolean) => void; // 用于更新 openWallet 状态的方法
}

// 使用 zustand 创建全局状态管理的 store
export const useWalletPop = create<AppState>((set) => ({
    // 初始化 openWallet 的值为 false，表示钱包弹窗默认关闭
    openWallet: false,
    // 定义 setOpenWallet 方法，用于更新 openWallet 的值
    setOpenWallet: (openWallet = true) => {
        return set({ openWallet }); // 使用 set 方法更新状态
    },
}));

// 导出 useWalletPop 以供其他组件使用
export default useWalletPop;
