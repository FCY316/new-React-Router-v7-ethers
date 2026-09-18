import { useEffect } from "react";
import { isRouteErrorResponse, Links, Link, Outlet, Scripts, ScrollRestoration } from "react-router";
import RouteProgress from "@/components/RouteProgress";
import type { Route } from "./+types/root";
import StyleProvider from "@/components/StyleProvider";
import WalletProviderModal from "@/components/WalletProviderModal";
import useConnectWalletInt from "@/store/wallet/useConnectWalletInt";
import { restoreLanguage } from "@/i18n";
import "@/style/index.css";

const appName = "EVM Web3";
const socialDescription = "xxxxxx";
// 相对路径会随实际访问网站的域名解析，不能误用配置给后端接口的 VITE_APP_URL。
const socialImagePath = "/icon-512.png";

/** 浏览器标签、安装后的 Web App 与 iOS 主屏幕共用同一套品牌图标。 */
export const links: Route.LinksFunction = () => [
  // 浏览器标签页、收藏夹等传统场景的站点图标。
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  // Android / Chrome 安装 PWA 时优先使用的标准尺寸图标。
  { rel: "icon", type: "image/png", href: "/icon-192.png", sizes: "192x192" },
  // iPhone / iPad「添加到主屏幕」时使用的专用图标。
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
  // PWA 清单：声明可安装应用的名称、启动方式和 192/512 图标。
  { rel: "manifest", href: "/site.webmanifest" },
];

/** 文档外壳由框架统一管理。允许手机缩放，主题类由 next-themes 在浏览器恢复。 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{appName}</title>
        {/* 链接预览：微信、Telegram、Discord、Slack 等会读取 Open Graph，而非 favicon 或 PWA 清单。 */}
        <meta property="og:type" content="website" />
        {/* 分享卡片中显示的网站名称。 */}
        <meta property="og:title" content={appName} />
        {/* 分享卡片中显示的介绍文字；确定文案后替换 xxxxxx。 */}
        <meta property="og:description" content={socialDescription} />
        {/* 分享卡片中的 Logo。用相对路径避免误用后端接口域名。 */}
        <meta property="og:image" content={socialImagePath} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        {/* X（原 Twitter）的对应分享卡片字段。 */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={appName} />
        <meta name="twitter:description" content={socialDescription} />
        <meta name="twitter:image" content={socialImagePath} />
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
