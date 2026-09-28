import { useCallback } from "react";
import { bech32 } from "bech32";
import { getAddress, getBytes, hexlify, isAddress } from "ethers";
import useAddressType from "@/store/addressType";

// MOCIUS 地址在 Bech32 中使用的固定人类可读前缀，例如 hg1...。
const HG_PREFIX = "hg";
// EVM 十六进制地址的固定前缀，例如 0x1234...。
const EVM_PREFIX = "0x";
// EVM 账户地址固定为 20 字节；转换 hg 地址时以此拒绝非账户地址数据。
const EVM_ADDRESS_BYTES = 20;

/** 将 EVM 的 20 字节地址编码为 MOCIUS 的 hg Bech32 地址。 */
export function evmToHg(address: string): string {
  // getAddress 同时校验并规范化 EVM 地址，getBytes 取出其中的 20 字节数据。
  const bytes = getBytes(getAddress(address));
  // Bech32 不能直接编码字节，需先转成 5 bit 一组的 words。
  return bech32.encode(HG_PREFIX, bech32.toWords(bytes));
}

/** 将 MOCIUS 的 hg Bech32 地址还原为 EVM 地址。 */
export function hgToEvm(address: string): string {
  // Bech32 地址不允许混合大小写，统一小写后再解码。
  const decoded = bech32.decode(address.toLowerCase());

  // 只接受本应用约定的 hg 前缀，避免将其他 Bech32 地址误认为账户地址。
  if (decoded.prefix !== HG_PREFIX) {
    throw new Error("Expected an hg1 MOCIUS address");
  }

  // 还原 8 bit 字节，并确认长度恰好是一个 EVM 账户地址。
  const bytes = Uint8Array.from(bech32.fromWords(decoded.words));
  if (bytes.length !== EVM_ADDRESS_BYTES) {
    throw new Error("Invalid MOCIUS account address length");
  }

  // hexlify 生成 0x 十六进制文本；getAddress 返回校验和格式的 EVM 地址。
  return getAddress(hexlify(bytes));
}

/**
 * 根据 addressType 转换地址的展示格式；转换失败时返回原始值，避免无效输入影响界面渲染。
 */
const useAddressConvert = () => {
  // addressType 是全局展示偏好；setAddressType 会在 hg 与 0x 之间切换。
  const { addressType, setAddressType } = useAddressType();

  const addressConvert = useCallback((address: string): string => {
    // 空地址通常表示钱包未连接，原样返回以方便调用方直接渲染。
    if (!address) return address;

    try {
      const normalizedAddress = address.toLowerCase();
      if (addressType === "0x") {
        // 当前需要 EVM 格式：原本就是 0x 地址时无需重复转换。
        return normalizedAddress.startsWith(EVM_PREFIX) ? address : hgToEvm(normalizedAddress);
      }

      // 当前需要 hg 格式：Bech32 统一以小写展示；其他输入按 EVM 地址编码。
      return normalizedAddress.startsWith(HG_PREFIX) ? normalizedAddress : evmToHg(address);
    } catch (error) {
      // 展示层不因某一个无效地址崩溃，保留输入值并输出诊断信息。
      console.warn("Unable to convert address format", error);
      return address;
    }
  }, [addressType]);

  const validateAddress0x = (address: string): boolean => {
    try {
      // 先快速检查前缀，再调用 ethers 校验地址长度与校验和。
      return address.toLowerCase().startsWith(EVM_PREFIX) && isAddress(address);
    } catch {
      // 兼容空值、格式错误或底层库抛出的解析异常。
      return false;
    }
  };

  const validateAddressHg = (address: string): boolean => {
    try {
      // 能成功还原为有效 EVM 地址，才认为 hg 地址有效。
      return address.toLowerCase().startsWith(HG_PREFIX) && isAddress(hgToEvm(address));
    } catch {
      return false;
    }
  };

  return {
    // 保留旧项目的 API 名称，供按钮等交互控件直接切换展示格式。
    changeAddressType: setAddressType,
    // 按当前 addressType 返回可展示的地址字符串。
    addressConvert,
    // 同时接受两种合法格式。
    validateAddress: (address: string) => validateAddress0x(address) || validateAddressHg(address),
    // 仅验证单一格式，适合表单输入场景。
    validateAddress0x,
    validateAddressHg,
    // 保留旧项目的转换函数别名：分别转换到 0x 与 hg。
    transition0x: hgToEvm,
    transitionhg: evmToHg,
  };
};

export default useAddressConvert;
