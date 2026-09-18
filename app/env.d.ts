/// <reference types="vite/client" />

/**
 * Vite 仅会把 VITE_ 前缀的变量替换到浏览器构建产物。
 * 因此这里的字段只能存放公开配置，不能放私钥、助记词、后端密钥或数据库密码。
 */
interface ImportMetaEnv {
  /** 当前构建使用的业务环境：development、test 或 production。 */
  readonly VITE_APP_ENV: "development" | "test" | "production";
  /** 可选的公开 API 基础地址；为空时由业务模块采用相对路径或不发起该类请求。 */
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
