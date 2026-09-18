import { useEffect, useRef } from 'react';

import {
    SELECTED_PROVIDER_STORAGE_KEY,
    useConnectWalletEvmStore,
} from './connectWallet/useWalletEvm';
import { getLocal } from './tools/strage';

/**
 * 应用启动时恢复上一次 EVM 钱包会话。
 *
 * 恢复流程必须等待 EIP-6963 公告列表中出现已保存的 rdns。由于 uuid 只在当前页面会话内有效，
 * 刷新后需先通过 rdns 找到新公告的 provider，再以该 provider 新的 uuid 调用 eth_accounts 静默检查
 * 授权状态；不会触发 eth_requestAccounts，但当前网络不符合项目要求时会请求切换到默认支持链。
 * @param removeLocalToken 地址或网络变化后需要清理业务登录态时传入的回调。
 */
const useConnectWalletInt = (removeLocalToken?: Function) => {
    const {
        addressEvm,
        connectWalletEvmStore,
        discoverWalletProviders,
        walletProviders,
    } = useConnectWalletEvmStore();
    // 钱包发现只在挂载时发起；避免 provider 列表更新后又重复请求公告。
    useEffect(() => {
        discoverWalletProviders();
    }, [discoverWalletProviders]);

    // 同一钱包自动恢复失败后，不应在每次重复公告时再次尝试。
    const attemptedProviderRdns = useRef<string | null>(null);

    useEffect(() => {
        const providerRdns = getLocal(SELECTED_PROVIDER_STORAGE_KEY);
        // 每次页面加载都会出现新的 uuid；rdns 是本地保存的钱包偏好匹配键。
        const providerDetail = walletProviders.find(
            ({ info }) => info.rdns === providerRdns
        );
        if (providerRdns && !addressEvm && providerDetail && attemptedProviderRdns.current !== providerRdns) {
            attemptedProviderRdns.current = providerRdns;
            // 恢复会话仅以 eth_accounts 检查授权；若链不匹配，连接逻辑会请求切换到 evmChain[0]。
            connectWalletEvmStore(
                providerDetail.info.uuid,
                removeLocalToken,
                true,
                false
            );
        }

    }, [
        addressEvm,
        connectWalletEvmStore,
        removeLocalToken,
        walletProviders,
    ]);
};
export default useConnectWalletInt;
