import useConnectWallet from "@/store/wallet/useConnectWallet"
import { Button } from "@/components/ui/button"
import CopyText from "@/components/CopyText"
import useAddressConvert from "@/hooks/useAddressConvert"

const Header = () => {
  const { connectWalletStore, address: xAddress } = useConnectWallet()
  const { addressConvert, changeAddressType } = useAddressConvert()
  const address = addressConvert(xAddress)
  return (
    <div className="flex min-w-0 items-center gap-2 px-4 py-3">
      {/* 手机上的长地址省略显示，完整地址可通过旁边的复制按钮获取。 */}
      <Button className="min-h-11 min-w-0 max-w-full" onClick={() => { connectWalletStore() }}><span className="truncate">{address || "连接钱包"}</span></Button>
      {address && <CopyText text={address} />}
      <Button className="min-h-11 min-w-0 max-w-full" onClick={() => { changeAddressType() }}><span className="truncate">切换地址</span></Button>
    </div>
  )
}

export default Header
