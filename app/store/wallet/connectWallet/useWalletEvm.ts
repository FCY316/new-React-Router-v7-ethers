import { BrowserProvider, JsonRpcSigner } from "ethers";
import i18n from "i18next";
import { toast } from "sonner";
import { create } from "zustand";

import { evmChain } from "@/collocate";
import type { objKeyObjectType } from "@/interface";
import useWalletPop from "@/store/walletPop";

import connectedWalletEvm from "../tools/connected/connectedWalletEvm";
import {
  type Eip6963ProviderDetail,
  findEip6963Provider,
  getEip6963Providers,
  requestEip6963Providers,
  subscribeEip6963Providers,
} from "../tools/eip6963";
import contractEvm, { intContractEvm } from "../tools/contract/contractEvm";
import { changeChainID } from "../tools/setChain/changeChain";
import { removeLocal, setLocal } from "../tools/strage";
import {
  watchSetAddressEvm,
  watchSetNetWorkEvm,
} from "../tools/watch/watchEvm";

/**
 * 持久化用户上一次选择的钱包 rdns。
 * EIP-6963 uuid 只在当前页面会话内唯一，刷新页面后钱包会公告新的 uuid，因此不能用于恢复会话。
 * rdns 虽然不可作为安全验证依据，但适合作为“用户偏好哪个钱包”的跨页面匹配键。
 */
const SELECTED_PROVIDER_STORAGE_KEY = "walletEvmProviderRdns";

/** EVM 钱包连接状态和对外操作。 */
interface ConnectWalletEvmState {
  /**
   * 连接指定 UUID 的 provider。
   * 不传 UUID 时只打开选择弹窗；requestAccess=false 时采用静默 eth_accounts 恢复。
   */
  connectWalletEvmStore: (
    providerUuid?: string,
    watchChangeFun?: Function,
    changeChain?: boolean,
    requestAccess?: boolean,
  ) => Promise<boolean>;
  /** 仅重置 DApp 内连接状态和本地偏好；注入钱包不能被网页强制登出。 */
  disconnectWalletEvmStore: () => void;
  /** 主动重新派发 requestProvider，用于再次扫描晚注入的钱包。 */
  discoverWalletProviders: () => void;
  /** 所有已公告的 EIP-6963 provider，供钱包选择 UI 展示。 */
  walletProviders: Eip6963ProviderDetail[];
  /** 当前 provider 所在的 EVM chain ID。 */
  chainId: number | null;
  /** 当前 provider 的展示名称。 */
  walletNameEvm: string | null;
  /** 当前页面会话中 provider 的 UUID，仅用于当前连接，不用于跨页面持久化。 */
  walletProviderUuidEvm: string | null;
  /** 当前第一个已授权账户地址。 */
  addressEvm: string;
  /** ethers 对 EIP-1193 provider 的封装。 */
  providerEvm: BrowserProvider | null;
  /** 当前账户的 signer，用于发送交易与签名。 */
  signer: JsonRpcSigner | null;
  /** 根据 chainId 和 signer 构建的项目合约实例。 */
  contractEvm: objKeyObjectType;
}

/**
 * 当前连接只应有一组账户/网络监听器。模块级引用使重连时能够先清理旧 provider 的监听器；
 * 不能使用 removeAllListeners，否则会误删其他业务或第三方库注册的监听器。
 */
let stopWatching: (() => void) | undefined;

/** ethers 网络 ID 为 bigint，而 chainChanged 通常传十六进制字符串；统一转为 number 供配置比对。 */
const toChainId = (chainId: bigint | number | string) => Number(chainId);

/**
 * EIP-6963 多钱包连接状态。
 *
 * 发现 provider、请求账户、切链、创建合约和监听账户变更均在此收敛，页面组件只通过
 * useConnectWallet 使用稳定的地址、signer 和连接函数。
 */
export const useConnectWalletEvmStore = create<ConnectWalletEvmState>((set) => {
  /** 清除上一轮连接留下的两个事件监听器，防止同一事件触发多次重连。 */
  const clearWatching = () => {
    stopWatching?.();
    stopWatching = undefined;
  };

  /**
   * 断开 DApp 与钱包的关联。
   * 注入钱包没有通用的 disconnect RPC，因此这里只清除本地状态、持久化 rdns 与本应用监听器。
   */
  const disconnectWalletEvmStore = () => {
    clearWatching();
    removeLocal(SELECTED_PROVIDER_STORAGE_KEY);
    set({
      addressEvm: "",
      providerEvm: null,
      walletNameEvm: null,
      walletProviderUuidEvm: null,
      signer: null,
      chainId: null,
      contractEvm: intContractEvm,
    });
  };

  /**
   * 连接指定的 EIP-6963 provider。
   *
   * @param providerUuid 用户在钱包弹窗选中的、仅当前页面有效的 UUID；缺失时仅打开弹窗，不擅自选择第一个钱包。
   * @param watchChangeFun 地址或网络变化后、状态重新同步完成时执行的业务回调。
   * @param changeChain 当前网络不受支持时是否请求切换到默认支持链。
   * @param requestAccess true 使用 eth_requestAccounts，false 使用无弹窗的 eth_accounts。
   */
  const connectWalletEvmStore = async (
    providerUuid?: string,
    watchChangeFun?: Function,
    changeChain = true,
    requestAccess = true,
  ) => {
    // 每次连接前再次请求公告，兼容钱包扩展比应用更晚完成注入的情形。
    requestEip6963Providers();

    if (!providerUuid) {
      // 多钱包环境必须由用户选择 provider，不能擅自选取列表中的任意钱包。
      useWalletPop.getState().setOpenWallet(true);
      return false;
    }

    // UUID 是本次连接的唯一依据，名称和 rdns 都不参与 provider 的选择。
    const providerDetail = findEip6963Provider(providerUuid);
    if (!providerDetail) {
      console.warn(`未找到 EIP-6963 provider: ${providerUuid}`);
      return false;
    }

    try {
      // 先取得账户、ethers BrowserProvider 与 signer；静默模式无授权账户会直接返回 null。
      let connectedWallet = await connectedWalletEvm(
        providerDetail,
        requestAccess,
      );
      if (!connectedWallet) return false;

      // BrowserProvider 返回的 network.chainId 是 bigint，先统一为配置使用的 number。
      let chainId = toChainId(
        (await connectedWallet.providerEvm.getNetwork()).chainId,
      );

      if (!evmChain.includes(chainId) && changeChain) {
        // 保留现有行为：由 changeChain 决定是否请求切链；账户恢复本身只调用 eth_accounts。
        const switched = await changeChainID(
          connectedWallet.providerEvm,
          evmChain[0],
        );
        if (!switched) return false;

        // 切链后创建新的 BrowserProvider，避免使用旧网络的合约与 signer。
        connectedWallet = await connectedWalletEvm(providerDetail, false);
        if (!connectedWallet) return false;
        chainId = toChainId(
          (await connectedWallet.providerEvm.getNetwork()).chainId,
        );
      }

      // provider、signer 均已最终确定，接着替换旧连接的监听器。
      clearWatching();
      const stopAddressWatching = watchSetAddressEvm(
        providerDetail.provider,
        async (accounts) => {
          if (accounts.length === 0) {
            // 用户在扩展中锁定/移除了所有账户时，不能保留旧地址或旧 signer。
            disconnectWalletEvmStore();
            watchChangeFun?.();
            return;
          }

          // 账户切换后用 eth_accounts 重建 signer，避免再次弹出授权窗口。
          const reconnected = await connectWalletEvmStore(
            providerUuid,
            watchChangeFun,
            false,
            false,
          );
          if (reconnected) watchChangeFun?.();
        },
      );
      const stopNetworkWatching = watchSetNetWorkEvm(
        providerDetail.provider,
        async (changedChainId) => {
          // 网络变化会使旧合约实例失效，因此重新读取网络、signer 和对应合约。
          const reconnected = await connectWalletEvmStore(
            providerUuid,
            watchChangeFun,
            false,
            false,
          );
          if (reconnected) watchChangeFun?.();

          // EIP-1193 的 chainChanged 参数通常为 "0x..."，Number 可同时解析十进制与十六进制。
          const numericChainId = toChainId(changedChainId);
          if (!evmChain.includes(numericChainId)) {
            toast.warning(
              i18n.t("com.chainNotSupported", { chain: numericChainId }),
            );
          }
        },
      );
      // 将两个单独的清理函数组合为当前连接唯一的清理入口。
      stopWatching = () => {
        stopAddressWatching();
        stopNetworkWatching();
      };

      // 合约必须在最终 chainId 确定后创建，避免切链前的 signer 被错误复用。
      const contract = contractEvm(chainId, connectedWallet.signer);
      // 仅在完整连接成功后保存 rdns，刷新页面后可用新公告的 uuid 重新定位该钱包。
      setLocal(SELECTED_PROVIDER_STORAGE_KEY, providerDetail.info.rdns);
      set({
        addressEvm: connectedWallet.addressEvm,
        providerEvm: connectedWallet.providerEvm,
        signer: connectedWallet.signer,
        contractEvm: contract,
        walletNameEvm: providerDetail.info.name,
        walletProviderUuidEvm: providerUuid,
        chainId,
      });
      return true;
    } catch (error) {
      // 用户拒绝授权、钱包 RPC 报错等都不污染已有连接状态，调用方根据 false 保持弹窗打开。
      console.error("error-connectedWalletEvm", error);
      return false;
    }
  };

  /** 供钱包弹窗与初始化 Hook 调用的手动扫描入口。 */
  const discoverWalletProviders = () => requestEip6963Providers();
  // 该订阅会在页面生命周期内保留，符合 EIP-6963 的发现要求。
  subscribeEip6963Providers((walletProviders) => set({ walletProviders }));

  return {
    connectWalletEvmStore,
    disconnectWalletEvmStore,
    discoverWalletProviders,
    walletProviders: getEip6963Providers(),
    addressEvm: "",
    walletNameEvm: null,
    walletProviderUuidEvm: null,
    chainId: null,
    providerEvm: null,
    signer: null,
    contractEvm: intContractEvm,
  };
});

export { SELECTED_PROVIDER_STORAGE_KEY };
