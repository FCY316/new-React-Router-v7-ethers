/**
 * 统一导出浏览器可公开使用的环境配置。
 *
 * 业务代码优先从此模块读取，避免散落的 import.meta.env 字段名称难以维护；
 * Vite 会在打包时替换字段，因此运行时不能依赖修改环境文件即时生效，修改后须重启开发服务或重新构建。
 */
export const env = {
  appEnv: import.meta.env.VITE_APP_ENV,
  appUrl: import.meta.env.VITE_APP_URL.replace(/\/$/, ""),
} as const;
