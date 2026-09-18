# EVM Web3 前端模板

基于 React 19、React Router 8 框架模式、Vite、TypeScript、Tailwind CSS v4、shadcn/ui（Radix Nova）、Sonner、ethers v6 和 Zustand 的纯前端项目。

## 开发与检查

建议使用 Node.js 24 LTS，框架最低要求 22.22.0；旧项目的 Node 20 不适用。统一使用 Yarn Classic 1.22.22，只维护 yarn.lock。

```bash
nvm install
nvm use
yarn install --frozen-lockfile
yarn dev
```

地址以终端输出为准，指定端口使用 `yarn dev --port 3001`。

```bash
yarn typecheck
yarn test
yarn build
yarn preview
```

`start:dev/test/pro`、`build:dev/test/pro` 保留旧项目的命令习惯，分别使用 development、test、production 模式。项目已提供 `.env.development`、`.env.test`、`.env.production`，分别设置 `VITE_APP_ENV` 与公开的 `VITE_APP_URL`。具体 API 地址写入未提交的 `.env.development.local`、`.env.test.local` 或 `.env.production.local` 覆盖默认值。业务代码从 `@/config/env` 读取配置，不再使用 `process.env.REACT_APP_*`。VITE_ 变量会暴露给浏览器，不能填写私钥。

## 结构与渲染

`react-router.config.ts` 设置 `ssr: false`，运行时使用客户端渲染。构建阶段仍会生成启动 HTML，所以模块顶层不能无条件访问 window、document 或 localStorage。

- `app/root.tsx`：文档外壳、启动占位、错误边界、主题、全局提示、钱包恢复。
- `app/components/RouteProgress.tsx`：基于 `useNavigation` 的全局路由进度条；仅在实际 pending 时显示。
- `app/routes.ts`：框架路由注册；首页为 `app/routes/home.tsx`。
- `app/Layout/`：公共头部与底部，子路由通过 Outlet 渲染。
- `app/components/ui/`：shadcn 组件源码，直接导入使用。
- `app/style/index.css`：Tailwind v4 与主题令牌，通过官方 Vite 插件编译。
- `app/locales/`、`app/i18n.ts`：中、英、日、韩翻译与初始化。
- `app/store/wallet/`：EIP-6963 发现、会话恢复、ethers 与合约实例。

新增页面时在 routes.ts 注册 `route("路径", "routes/文件.tsx")`。不再嵌套 BrowserRouter，也不使用旧路由守卫。路由数据可以使用 clientLoader/clientAction；钱包授权由用户点击触发。

## 钱包与链配置

调用 `useConnectWallet().connectWalletStore()` 打开钱包列表，用户选择后才向对应 provider 请求账户。

连接成功保存 `walletEvmProviderRdns`。刷新后等待该钱包公告，通过当次 UUID 和 eth_accounts 恢复已授权账户。恢复不重新请求账户授权；保留旧项目行为，当前链不支持时请求切换到默认链，这一步可能弹出钱包确认。

仅展示实际公告 EIP-6963 的钱包。手机普通浏览器不一定注入钱包，需要在支持该协议的钱包浏览器中使用。没有加入 WalletConnect 或 window.ethereum 兜底。断开仅清除本站会话和偏好，不撤销扩展授权。rdns 是偏好匹配字段，不能用于验证钱包真实性。

支持链由 `app/collocate.ts` 中 evmChain 决定，第一项为默认链。本次保留原项目 `[1677]`、RPC 与合约地址；迁移不代表已验证这些链上部署。

增加 56 链需要：

1. 将 56 加入 evmChain。
2. 检查 chainParams[56] 的 RPC、原生币、区块浏览器配置。
3. 在 `app/store/wallet/tools/contract/cAddress.ts` 的 evmCAddress 中新增 56 对应合约地址和 ABI。

仅配置 chainParams 不会启用该链。合约调用前检查钱包连接、当前链和合约实例，不要直接复用其他链地址。

## UI 与提示

直接从 `@/components/ui/button` 等文件导入组件。新增组件可运行 `npx shadcn@latest add 组件名`；Yarn 1 不支持 yarn dlx。工具别名指向已有 utils，没有另建 lib 目录。

全局仅挂载一次 Toaster，业务中直接调用：

```tsx
import { toast } from "sonner";
toast.success("操作成功");
toast.error("操作失败");
```

UI 保留原来的 Button/DialogOverlay forwardRef 兼容改动，并非完全未修改的官方源码；React 19 下仍可正常使用。新项目不需要旧 react-i18next 类型补丁，不包含 patch-package、antd、react-toastify 或 CRA/CRACO。

## 品牌图标与链接分享

以下资源均由 `app/root.tsx` 统一声明，替换品牌时应一并更新。`site.webmanifest` 是严格 JSON，不能添加注释，因此在此记录用途。

| 文件 | 用途 |
| --- | --- |
| `public/favicon.ico` | 浏览器标签页与收藏夹图标。 |
| `public/icon-192.png` | Android / Chrome 安装 PWA 时的标准图标。 |
| `public/icon-512.png` | 高分辨率 PWA 图标；同时作为聊天平台链接预览的 Logo。 |
| `public/apple-touch-icon.png` | iPhone / iPad 添加到主屏幕时的图标。 |
| `public/site.webmanifest` | PWA 名称、启动模式、主题色及 192/512 图标清单。 |

聊天软件的链接预览由 `og:title`、`og:description`、`og:image` 控制，不读取 favicon 或 PWA 清单。目前介绍文字为 `xxxxxx`，确认文案后在 `app/root.tsx` 的 `socialDescription` 中替换即可。分享图片使用相对路径 `/icon-512.png`，不要把给后端 API 使用的 `VITE_APP_URL` 填进分享字段。

钱包弹窗可在小屏滚动，全局提示考虑手机安全区域。Tailwind v4 面向现代浏览器，旧手机浏览器需要设备实测。

## 测试与部署

Vitest + jsdom 覆盖重复公告、已授权恢复、未授权恢复、默认切链、断开清理和弹窗选择。测试使用模拟 provider，不签名、不发交易；真实 TP/MetaMask 与手机 WebView 仍需验收。

构建后只部署 `build/client` 到静态托管。服务器需要将前端路由回退到 index.html，Nginx 示例：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

`public/.well-known/appspecific/com.chrome.devtools.json` 是 Chrome DevTools 的探测文件，用于避免开发时把该浏览器请求误报为 React Router 路由错误，与业务路由无关。

构建日志的 SSR bundle 用于生成启动 HTML，不表示运行时需要 SSR 服务。@react-router/node 是框架构建所需依赖；`yarn preview` 只用于本地预览，不是生产服务器。

旧项目保留在原目录。新项目清理了脚手架欢迎页、服务端 Dockerfile、npm 锁文件、未使用的旧 RPC 和非 EVM 地址适配，没有迁移旧 CRA 测试与构建配置。
