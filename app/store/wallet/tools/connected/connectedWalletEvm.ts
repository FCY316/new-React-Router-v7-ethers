import { ethers } from "ethers";

import type { Eip6963ProviderDetail } from "../eip6963";

/**
 * 使用指定的 EIP-6963 provider 创建 ethers 连接对象。
 *
 * @param providerDetail 用户已选择的钱包 provider 及其公告信息。
 * @param requestAccess true 由用户点击触发，调用 eth_requestAccounts；false 用于刷新恢复或
 * 账户/网络变化后的同步，只调用 eth_accounts，因此不会意外弹出钱包授权窗口。
 * @returns 地址、BrowserProvider 和 signer；没有已授权账户时返回 null。
 */
const connectedWalletEvm = async (
  providerDetail: Eip6963ProviderDetail,
  requestAccess = true
) => {
  // 两种 RPC 的差异决定是否会触发钱包扩展的授权界面。
  const method = requestAccess ? "eth_requestAccounts" : "eth_accounts";
  const accounts = await providerDetail.provider.request({ method });

  // EIP-1193 返回值属于外部输入；无账户或格式不符时不继续创建无效 signer。
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string") {
    return null;
  }

  // ethers v6 的 BrowserProvider 将原始 EIP-1193 request 接口包装为标准 Provider API。
  const providerEvm = new ethers.BrowserProvider(providerDetail.provider as any);
  // 显式传入刚验证过的账户，避免 ethers 再选择一个与当前地址不同的默认账户。
  const signer = await providerEvm.getSigner(accounts[0]);
  const addressEvm = await signer.getAddress();

  return {
    providerEvm,
    addressEvm,
    signer,
  };
};

export default connectedWalletEvm;
