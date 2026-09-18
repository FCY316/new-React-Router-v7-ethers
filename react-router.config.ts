import type { Config } from "@react-router/dev/config";

export default {
  // 纯前端 SPA：仅在构建时生成启动 HTML，部署 build/client 即可。
  // 构建仍会导入根路由，浏览器 API 必须在客户端挂载后使用。
  ssr: false,
} satisfies Config;
