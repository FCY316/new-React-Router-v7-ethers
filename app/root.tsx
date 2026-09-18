import { useEffect } from "react";
import { isRouteErrorResponse, Links, Link, Outlet, Scripts, ScrollRestoration } from "react-router";
import RouteProgress from "@/components/RouteProgress";
import type { Route } from "./+types/root";
import StyleProvider from "@/components/StyleProvider";
import WalletProviderModal from "@/components/WalletProviderModal";
import useConnectWalletInt from "@/store/wallet/useConnectWalletInt";
import { restoreLanguage } from "@/i18n";
import "@/style/index.css";

/** 文档外壳由框架统一管理。允许手机缩放，主题类由 next-themes 在浏览器恢复。 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>EVM Web3</title>
        <Links />
      </head>
      <body>
        {/* 主题脚本随启动 HTML 一起生成，避免 SPA 挂载后才插入 script 而触发 React 开发警告。 */}
        <StyleProvider>{children}</StyleProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/** SPA 构建时只渲染启动界面，不请求账户或访问浏览器钱包。 */
export function HydrateFallback() {
  return <main className="flex min-h-dvh items-center justify-center" role="status">正在加载…</main>;
}

/** 全局能力只挂载一次，切换子路由时保持钱包会话、主题、提示容器和导航进度。 */
export default function App() {
  useConnectWalletInt();
  useEffect(() => { restoreLanguage(); }, []);
  return <><RouteProgress /><WalletProviderModal /><Outlet /></>;
}

/** 框架处理未知路由，避免旧守卫跳转到不存在的 /noPage 后形成循环。 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="mx-auto max-w-lg space-y-4 px-4 py-16">
      <h1 className="text-xl font-semibold">{missing ? "页面不存在" : "页面暂时无法显示"}</h1>
      <Link to="/" className="underline">返回首页</Link>
      {import.meta.env.DEV && error instanceof Error && <pre className="overflow-auto text-xs">{error.stack}</pre>}
    </main>
  );
}
