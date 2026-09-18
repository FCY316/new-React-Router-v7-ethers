import type { Eip1193Provider } from "../eip6963";

/**
 * 监听当前选中 provider 的账户变更。
 *
 * @returns 仅移除本函数注册 handler 的清理函数；不使用 removeAllListeners，避免影响其他模块。
 */
export const watchSetAddressEvm = (
  provider: Eip1193Provider,
  fun?: (accounts: string[]) => void
) => {
  // EIP-1193 约定第一个参数为账户数组，仍需在运行时验证扩展传入的数据。
  const handler = (...args: unknown[]) => {
    const accounts = args[0];
    fun?.(
      Array.isArray(accounts)
        ? accounts.filter((item): item is string => typeof item === "string")
        : []
    );
  };

  // on/removeListener 是可选的：不支持事件的钱包仍可完成一次性连接。
  provider.on?.("accountsChanged", handler);
  return () => provider.removeListener?.("accountsChanged", handler);
};

/**
 * 监听当前选中 provider 的链变更。
 *
 * @returns 仅移除本函数注册 handler 的清理函数；不影响其他订阅方。
 */
export const watchSetNetWorkEvm = (
  provider: Eip1193Provider,
  fun?: (chainId: string) => void
) => {
  // chainChanged 的第一个参数按 EIP-1193 为链 ID 字符串，通常形如 "0x1"。
  const handler = (...args: unknown[]) => {
    const chainId = args[0];
    if (typeof chainId === "string") fun?.(chainId);
  };

  provider.on?.("chainChanged", handler);
  return () => provider.removeListener?.("chainChanged", handler);
};
