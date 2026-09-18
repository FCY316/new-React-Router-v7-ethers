import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

// 创建一个自定义的 useDebounceFn Hook 防抖
function useDebounceFn<T extends (...args: any[]) => any>(fn: T, delay: number) {
    const fnRef = useRef(fn); // 保存最新的函数引用
    const timer = useRef<NodeJS.Timeout | null>(null);

    // 更新 fnRef 当前引用
    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    const debounced = useCallback((...args: Parameters<T>) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }

        timer.current = setTimeout(() => {
            fnRef.current(...args); // 始终调用最新的函数
        }, delay);
    }, [delay]);

    useEffect(() => {
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, []);

    return debounced;
}

export default useDebounceFn;