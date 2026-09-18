import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

// 后续页面在这里注册，框架负责分包与导航，不再嵌套 BrowserRouter。
export default [
  layout("Layout/index.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
  ]),
] satisfies RouteConfig;
