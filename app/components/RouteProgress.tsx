import { useEffect, useRef, useState } from "react";
import { useNavigation } from "react-router";

/**
 * 全局路由切换进度条。
 *
 * useNavigation 会在 React Router 正在加载路由模块、clientLoader 或提交 action 时变为非 idle。
 * 150ms 内完成的切换不显示进度条，避免快速点击造成顶部闪烁；已显示的进度条会先补满再淡出，
 * 让用户能明确感知到一次导航已经结束。
 */
const RouteProgress = () => {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";
  const [visible, setVisible] = useState(false);
  const [completed, setCompleted] = useState(false);
  const showTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // 每次导航状态更新前清掉上一轮计时器，避免旧导航结束后误隐藏新导航的进度条。
    window.clearTimeout(showTimer.current);
    window.clearTimeout(hideTimer.current);

    if (isNavigating) {
      setCompleted(false);
      if (!visible) {
        showTimer.current = window.setTimeout(() => setVisible(true), 150);
      }
    } else if (visible) {
      // 路由就绪后先补满，再给 CSS 180ms 的淡出时间。
      setCompleted(true);
      hideTimer.current = window.setTimeout(() => {
        setVisible(false);
        setCompleted(false);
      }, 180);
    }

    return () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
    };
  }, [isNavigating, visible]);

  return (
    <>
      {/* 不依赖视觉进度条，屏幕阅读器同样能感知路由正在加载。 */}
      <div aria-live="polite" className="sr-only" role="status">
        {isNavigating ? "正在切换页面" : ""}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className={`h-full origin-left bg-primary shadow-[0_0_8px_var(--primary)] ${!visible
              ? "scale-x-0"
              : completed
                ? "scale-x-100 transition-transform duration-150"
                : "scale-x-[.85] motion-safe:animate-[route-progress_1.6s_ease-out_infinite_alternate]"
            }`}
        />
      </div>
    </>
  );
};

export default RouteProgress;
