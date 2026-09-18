import { BrowserProvider } from 'ethers';

import { chainParams } from '@/collocate';

/**
 * 切换以太坊网络链
 * @param provider - 以太坊浏览器提供者 (BrowserProvider)
 * @param chainID - 目标链的 ID (number)
 */
export const changeChainID = async (
  provider: BrowserProvider,
  chainID: number
) => {
  // EIP-1193 的 wallet_switchEthereumChain 要求 chainId 使用十六进制字符串。
  const params = [{ chainId: `0x${chainID.toString(16)}` }];
  try {
    // 调用以太坊钱包的方法进行链切换
    await (provider as any).send("wallet_switchEthereumChain", params);
    return true;
  } catch (e: any) {
    console.log("changeChainID", e);
    // 用户拒绝（4001 / ethers 的 ACTION_REJECTED）时不再继续请求，避免连续弹窗。
    const errorCode = e?.info?.error?.code ?? e?.code;
    if (errorCode !== 4001 && errorCode !== "ACTION_REJECTED") {
      // 常见原因是钱包尚未配置该网络；先尝试添加，再明确切换一次。
      const added = await addChainID(provider, chainID);
      if (!added) return false;

      // wallet_addEthereumChain 只负责添加，规范不保证钱包会自动切换到新网络。
      try {
        await (provider as any).send("wallet_switchEthereumChain", params);
        return true;
      } catch (switchError) {
        console.log("changeChainID-after-add", switchError);
      }
    }
    return false;
  }
};

/**
 * 添加新的以太坊网络链
 * @param provider - 以太坊浏览器提供者 (BrowserProvider)
 * @param chainID - 目标链的 ID (number)
 */
export const addChainID = async (
  provider: BrowserProvider,
  chainID: number
) => {
  try {
    // 配置缺失时不发送不完整的 RPC 参数给钱包。
    if (!chainParams[chainID]) return false;
    // 构造链的配置信息
    const data = {
      ...chainParams[chainID], // 获取对应链 ID 的参数配置
      chainId: `0x${chainID.toString(16)}`, // 转换为 16 进制格式
    };
    // 调用以太坊钱包的方法添加新的链
    await (provider as any).send("wallet_addEthereumChain", [data]);
    return true;
  } catch (e) {
    console.log("useChangeChain", e);
    return false;
  }
};
