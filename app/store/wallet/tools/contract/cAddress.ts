import type { Interface, InterfaceAbi } from "ethers"; // 仅导入 ABI 类型，不生成运行时代码。
import Erc20 from "./abi/Erc20.json"; // 引入 Router 合约的 ABI

import { evmChain } from "@/collocate";
/**
 * 定义一个对象 `evmCAddress`，用于存储 EVM 链（以 chainId 为键）上部署的所有合约地址与 ABI 信息
 * 格式为：
 * {
 *   [chainId: string]: {
 *     [contractName: string]: {
 *       address: string;      // 合约地址
 *       abi: Interface | InterfaceAbi;  // 合约 ABI，可以是 ethers 的 Interface 实例或原始 ABI 对象
 *     }
 *   }
 * }
 */
export const evmCAddress: {
  [key: string]: {
    [contractName: string]: { address: string; abi: Interface | InterfaceAbi };
  };
} = {
  [evmChain[0]]: {
    // 代币ERC20合约
    TokenErc20: {
      // address: "0x8AB13cEF518432124Ca9823264bDcF18B9C72a42",
      address: "0xFb80f39FAB83B5e503dB51d892713169e68D2e5A",
      abi: Erc20,
    },
  },
};
