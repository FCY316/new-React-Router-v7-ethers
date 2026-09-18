import {
  useEffect,
  useRef,
} from 'react';

/**
 * 受控轮询 Hook
 *
 * @param callback 轮询执行的函数
 * @param delay 间隔时间（毫秒）
 * @param controller 控制轮询的值（如布尔/状态/地址等）变化时重新启动
 * @param immediate 是否立即执行一次（默认 true）
 */
export default function useControllablePolling(
    callback: () => void,
    delay: number,
    controller: any, // 任意值，用于控制轮询开启或关闭（值改变即重启）
    immediate: boolean = true
) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!controller) {
            // 控制值为假时，不开启轮询
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        let isCancelled = false;

        const run = async () => {
            if (isCancelled) return;
            callback();
        };

        if (immediate) run(); // 可选首次立即执行

        intervalRef.current = setInterval(() => {
            run();
        }, delay);

        return () => {
            isCancelled = true;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [controller, delay, immediate, callback]);
}