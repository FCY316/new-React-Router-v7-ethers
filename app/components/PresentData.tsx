import { Spinner } from '@/components/ui/spinner';

// 定义 PresentData 组件，用于显示数据或加载状态
const PresentData = ({
    value,       // 要显示的值，可以是字符串或数字
    qText,
    text,        // 可选的文本内容
    loading,     // 是否处于加载状态
    className,   // 可选的自定义样式类
}: { value: string | number, loading: boolean, qText?: string, className?: string, text?: string }) => {
    return (
        <div className={`${className} `}> {/* 包裹内容的容器，支持自定义样式 */}
            {qText && qText}
            {loading ? (
                // 如果处于加载中，显示加载图标
                <Spinner className='inline-block align-middle' />
            ) : (
                // 如果未加载，显示传入的值
                value
            )}
            {text && text}
        </div>
    );
};

// 导出 PresentData 组件
export default PresentData;
