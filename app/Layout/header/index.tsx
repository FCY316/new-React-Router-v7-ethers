import useConnectWallet from "@/store/wallet/useConnectWallet"
import { Button } from "@/components/ui/button"
import CopyText from "@/components/CopyText"

const Header = () => {
  const { connectWalletStore, address } = useConnectWallet()
  return (
    <div className="flex min-w-0 items-center gap-2 px-4 py-3">
      {/* 手机上的长地址省略显示，完整地址可通过旁边的复制按钮获取。 */}
      <Button className="min-h-11 min-w-0 max-w-full" onClick={() => { connectWalletStore() }}><span className="truncate">{address || "连接钱包"}</span></Button>
      {address && <CopyText text={address} />}
    </div>
  )
}

export default Header
