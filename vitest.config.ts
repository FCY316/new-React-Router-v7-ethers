import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// 单元测试独立于路由构建插件运行，使用浏览器模拟环境测试钱包事件和 React 组件。
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./app", import.meta.url)) } },
  test: {
    environment: "jsdom",
    include: ["app/**/*.test.{ts,tsx}"],
    clearMocks: true,
    // Node 25 默认暴露的实验性 localStorage 会覆盖 jsdom 的浏览器存储。
    // 仅在测试子进程中关闭该能力，确保测试使用 jsdom，不影响应用运行。
    execArgv: ["--no-experimental-webstorage"],
  },
});
