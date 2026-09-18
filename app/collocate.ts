export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const evmChain = [1677];
export const chainParams: any = {
  1677: {
    chainId: 1677,
    chainName: "intl-text.net", // 自定义链的名称
    nativeCurrency: {
      name: "HUGE",
      symbol: "HUGE",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.interstellarchain.org/"],
    // 用于新区块、Transfer、Approval 等实时事件订阅。
    // webSocketUrls: ["ws://16.162.168.95:8546"],
    webSocketUrls: ["wss://rpc.interstellarchain.org"],
    blockExplorerUrls: ["https://scan.interstellarchain.org/"],
  },
  56: {
    chainId: 56,
    chainName: "BSC",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  97: {
    chainId: 97,
    chainName: "BSC Testnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-testnet-rpc.publicnode.com"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
  },
};
