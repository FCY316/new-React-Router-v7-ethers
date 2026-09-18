import {
    memo,
    useState,
} from 'react';

/**
 * 导入复制功能的工具函数和React相关库
 */
import { handleCopyClick } from '@/utils';
import { Check, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 定义复制组件的属性类型
 */
type CopyType = {
    text: string | number, // 需要复制的文本或数字
    className?: string, // 图标类名
}

/**
 * 复制组件，用于复制指定的文本或数字
 * @param {CopyType} props 组件属性
 */
const CopyText = ({ text, className }: CopyType) => {
    // 状态管理显示的图标，1为复制图标，2为成功图标，3为失败图标
    const [isShow, setIsShow] = useState(1)

    /**
     * 复制功能的事件处理函数
     * @param {any} e 事件对象
     */
    const copyFun = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // 阻止事件冒泡
        e.currentTarget.focus(); // 让复制函数能够找到当前弹窗的焦点范围
        // 调用复制工具函数，并根据复制结果更新显示的图标
        const flag = await handleCopyClick(text)
        flag ? setIsShow(2) : setIsShow(3)
        // 2秒后恢复为复制图标
        setTimeout(() => {
            setIsShow(1)
        }, 2000)
    }

    // 根据状态渲染对应的图标
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isShow === 2 ? '已复制' : isShow === 3 ? '复制失败，点击重试' : '复制地址'}
            onClick={copyFun}
        >
            {isShow === 1 && <Copy className={className} />}
            {isShow === 2 && <Check className={className} />}
            {isShow === 3 && <X className={className} />}
        </Button>
    )
}

// 导出复制组件
export default memo(CopyText)
