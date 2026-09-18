import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import "@/i18n";
import { evmChain } from "@/collocate";
import { useConnectWalletEvmStore, SELECTED_PROVIDER_STORAGE_KEY } from "./connectWallet/useWalletEvm";
import useConnectWalletInt from "./useConnectWalletInt";
import { requestEip6963Providers, getEip6963Providers } from "./tools/eip6963";
import type { Eip6963ProviderDetail } from "./tools/eip6963";
import WalletProviderModal from "@/components/WalletProviderModal";
import useWalletPop from "@/store/walletPop";

const address = "0x0000000000000000000000000000000000000001";
let accounts = [address];
let chainId = evmChain[0];
const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

// 模拟标准 EIP-1193 钱包，只响应账户和链查询；测试不会连接真实扩展、签名或发送交易。
const request = vi.fn(async ({ method, params }: { method: string; params?: unknown }) => {
  if (method === "eth_accounts" || method === "eth_requestAccounts") return accounts;
  if (method === "eth_chainId") return `0x${chainId.toString(16)}`;
  if (method === "wallet_switchEthereumChain") {
    chainId = Number((params as { chainId: string }[])[0].chainId);
    return null;
  }
  throw new Error(`Unexpected wallet RPC: ${method}`);
});
const detail: Eip6963ProviderDetail = {
  info: { uuid: "test-wallet-session", rdns: "test.wallet", name: "Test Wallet", icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>" },
  provider: {
    request,
    on: (event, handler) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
    },
    removeListener: (event, handler) => { listeners.get(event)?.delete(handler); },
  },
};
const announce = (value: Eip6963ProviderDetail) => window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: value }));

beforeEach(() => {
  useConnectWalletEvmStore.getState().disconnectWalletEvmStore();
  window.localStorage.clear();
  accounts = [address];
  chainId = evmChain[0];
  request.mockClear();
  requestEip6963Providers();
  announce(detail);
});
afterEach(() => {
  cleanup();
  useConnectWalletEvmStore.getState().disconnectWalletEvmStore();
  useWalletPop.getState().setOpenWallet(false);
});

describe("迁移后的 EIP-6963 钱包会话", () => {
  it("重复公告不重复列出同一个钱包", () => {
    announce(detail);
    expect(getEip6963Providers().filter(({ info }) => info.rdns === detail.info.rdns)).toHaveLength(1);
  });

  it("刷新使用保存的 rdns 恢复已授权账户，不重新请求账户授权", async () => {
    // 只保存 rdns，不保存临时 UUID，模拟跨刷新后通过新公告匹配钱包。
    window.localStorage.setItem(SELECTED_PROVIDER_STORAGE_KEY, detail.info.rdns);
    renderHook(() => useConnectWalletInt());
    await waitFor(() => expect(useConnectWalletEvmStore.getState().addressEvm).toBe(address));
    expect(request.mock.calls.some(([args]) => args.method === "eth_accounts")).toBe(true);
    expect(request.mock.calls.some(([args]) => args.method === "eth_requestAccounts")).toBe(false);
  });

  it("未授权钱包不会在刷新时强行弹出账户授权", async () => {
    accounts = [];
    expect(await useConnectWalletEvmStore.getState().connectWalletEvmStore(detail.info.uuid, undefined, false, false)).toBe(false);
    expect(useConnectWalletEvmStore.getState().addressEvm).toBe("");
    expect(request.mock.calls.some(([args]) => args.method === "eth_requestAccounts")).toBe(false);
  });

  it("用户连接时切到支持链，断开后移除偏好与本应用监听器", async () => {
    chainId = 1;
    expect(await useConnectWalletEvmStore.getState().connectWalletEvmStore(detail.info.uuid)).toBe(true);
    expect(useConnectWalletEvmStore.getState().chainId).toBe(evmChain[0]);
    expect(window.localStorage.getItem(SELECTED_PROVIDER_STORAGE_KEY)).toBe(detail.info.rdns);
    useConnectWalletEvmStore.getState().disconnectWalletEvmStore();
    expect(window.localStorage.getItem(SELECTED_PROVIDER_STORAGE_KEY)).toBeNull();
    expect(listeners.get("accountsChanged")?.size).toBe(0);
    expect(listeners.get("chainChanged")?.size).toBe(0);
  });

  it("钱包列表展示已发现 provider，点击后连接成功并关闭弹窗", async () => {
    render(<WalletProviderModal />);
    act(() => useWalletPop.getState().setOpenWallet(true));
    fireEvent.click(await screen.findByRole("button", { name: "Test Wallet" }));
    await waitFor(() => expect(useWalletPop.getState().openWallet).toBe(false));
    expect(useConnectWalletEvmStore.getState().addressEvm).toBe(address);
  });
});
