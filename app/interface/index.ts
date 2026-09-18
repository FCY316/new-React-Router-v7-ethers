import type { ReactNode } from "react";

import type { Contract } from "ethers";

export type LocalesType = "en" | "zh" | "ja" | "ko";
export interface RouteObjects {
  // 让不让menu读取
  menuReady?: boolean;
  name?: string;
  // 你懂的
  children?: RouteObjects[];
  // 你懂的
  element?: React.ReactNode;
  // 你懂的
  path?: string;
  // 权限校验
  auth?: boolean;
}
export type objKeyObjectType = {
  [key: string]: Contract | null;
  TokenErc20: Contract | null; // 代币ERC20合约
};

export interface numKeyObj {
  [key: number]: { chainName: string; symbol: string; chainID: number };
}
export interface strKeyReactNode {
  [key: string]: ReactNode;
}
export interface strKeyStr {
  [key: string]: string;
}
// axios 返回的数据格式
export interface MyResponseType<T> {
  code: number;
  msg: string;
  data: T;
}
