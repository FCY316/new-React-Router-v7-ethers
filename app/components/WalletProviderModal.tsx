import { SearchX } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import useConnectWallet from "@/store/wallet/useConnectWallet";
import useWalletPop from "@/store/walletPop";

/**
 * 钱包选择弹窗。
 *
 * EIP-6963 可能同时发现多个注入钱包，因此连接前必须把 provider 列表呈现给用户。
 * 此组件挂载在根路由，任意页面调用 connectWalletStore() 都能打开同一个弹窗。
 */
const WalletProviderModal = () => {
  // openWallet 由连接 store 在未传 UUID 时设置；这里仅负责展示和关闭弹窗。
  const { openWallet, setOpenWallet } = useWalletPop();
  const {
    connectWalletStore,
    discoverWalletProviders,
    walletProviders,
  } = useConnectWallet();
  // 只让用户当前点击的钱包按钮进入 loading，其他钱包仍保持可选。
  const [connectingUuid, setConnectingUuid] = useState<string>();

  useEffect(() => {
    // 每次打开都请求钱包重新公告，处理扩展在首次应用加载后才注入 provider 的场景。
    if (openWallet) discoverWalletProviders();
  }, [discoverWalletProviders, openWallet]);

  /**
   * 将用户点击的 UUID 传给连接 store。
   * 连接失败时保持弹窗打开，以便用户改选其他钱包或重试；成功后才关闭。
   */
  const connectProvider = async (providerUuid: string) => {
    setConnectingUuid(providerUuid);
    const connected = await connectWalletStore(providerUuid);
    setConnectingUuid(undefined);
    if (connected) setOpenWallet(false);
  };
  return (
    <Dialog
      open={openWallet}
      onOpenChange={(open) => setOpenWallet(open)}
    >
      {/* 官方 Dialog 负责模态交互；这里仅补充手机端可滚动的业务布局。 */}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>选择钱包</DialogTitle>
          {/* 保留描述供屏幕阅读器理解弹窗用途，视觉上不额外占用小屏空间。 */}
          <DialogDescription className="sr-only">
            从已发现的钱包扩展中选择一个进行连接。
          </DialogDescription>
        </DialogHeader>
        {/* 没有 provider 时提示重新扫描，直到钱包扩展公告可用的 EIP-6963 provider。 */}
        {walletProviders.length ? (
          <div className="flex flex-col gap-2">
            {walletProviders.map(({ info }) => (
              <Button
                className="h-14 w-full justify-start"
                disabled={connectingUuid === info.uuid}
                key={info.uuid}
                onClick={() => connectProvider(info.uuid)}
                variant="outline"
              >
                {/* 官方 Spinner 仅在当前被点击的钱包上显示，避免其他选项的状态被误解。 */}
                {connectingUuid === info.uuid && <Spinner aria-label="正在连接钱包" />}
                {/* EIP-6963 的 SVG icon 仅以 img 渲染，避免执行不受信任的脚本。 */}
                <img
                  alt=""
                  className="h-6 w-6 shrink-0 rounded"
                  src={info.icon}
                />
                <span className="min-w-0 truncate">{info.name}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-5 text-center">
            <SearchX aria-hidden className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm leading-5 text-muted-foreground">
              未发现支持 EIP-6963 的钱包扩展
            </p>
            {/* 再次派发 requestProvider，不需要刷新页面。 */}
            <Button onClick={discoverWalletProviders}>
              重新检测
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletProviderModal;
