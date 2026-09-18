import { useTranslation } from 'react-i18next'; // 引入国际化 Hook
import { Meh, Smile } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';

// 自定义空状态组件，用于在没有数据时显示
const CustomizeRenderEmpty = () => {
    const { t } = useTranslation(); // 使用国际化 Hook
    return (
        <div className='w-full text-center mt-3 text-white'>
            <Smile className='inline h-5 w-5 pb-1 mr-1' aria-hidden /> {/* 笑脸图标 */}
            <p className='text-xs'>{t('com.noData')}</p> {/* 使用国际化文本 */}
        </div>
    );
};

// 自定义“到底了”组件，用于在滚动到底部时显示
const OverCom = ({ className }: { className?: string }) => {
    const { t } = useTranslation(); // 使用国际化 Hook
    return (
        <div className={`w-full  my-3 flex items-center justify-center text-white ${className}`}>
            <Meh className='h-5 w-5 mr-1' aria-hidden /> {/* 表情图标 */}
            <p className='text-xs'>{t('com.reachedEnd')}</p> {/* 使用国际化文本 */}
        </div>
    );
};

// 滚动视图组件，支持滚动加载和自定义内容
const ScrollView = ({
    children, // 子组件内容
    px, // 滚动视图的高度偏移量
    className, // 自定义样式类
    minWidth = 768,
    scroll // 滚动相关配置，包括加载状态、滚动事件和是否到底
}: {
    children: React.ReactNode,
    px: string,
    className?: string,
    minWidth?: number,
    scroll?: { loading: boolean, onScroll: Function, isOver: boolean }
}) => {
    const { t } = useTranslation(); // 使用国际化 Hook

    // 滚动事件处理函数
    const onScroll = (e: any) => {
        // 判断是否滚动到底部
        if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 20) {
            if (scroll) {
                if (scroll.loading || scroll.isOver) return; // 如果正在加载或者结束了，则不触发滚动事件
                scroll.onScroll(); // 调用滚动事件回调
            }
        }
    };

    return (
        <>
            {/* 如果没有传入滚动配置，则仅渲染子组件 */}
            {
                !scroll && <div style={{ height: `calc(100vh - ${px})` }} className={` scrollbar-none overflow-y-auto ${className}`}>
                    {children}
                </div>
            }
            {/* 如果传入滚动配置，则渲染滚动视图 */}
            {scroll && <div
                onScroll={scroll ? onScroll : () => { }} // 绑定滚动事件
                style={{ height: `calc(100vh - ${px})` }}
                className={`scrollbar-none  overflow-y-auto overflow-x-hidden ${className}`}
            >
                {children}
                {/* 如果子组件为空且未加载，则显示空状态 */}
                {(children as any).length === 0 && !scroll.loading && <CustomizeRenderEmpty />}
                {/* 显示加载状态 */}
                <div className={`flex items-center justify-center my-4 w-full text-white ${scroll.loading ? '' : 'hidden'}`}>
                    <Spinner className='mr-2' /> {/* 加载图标 */}
                    <span className='text-xs '>{t('com.loading')}</span> {/* 使用国际化文本 */}
                </div>
                {/* 如果有子组件且滚动到底，则显示“到底了”状态 */}
                {(children as any).length > 0 && scroll.isOver && <OverCom />}
            </div>}
        </>
    );
};

// 导出滚动视图组件
export default ScrollView;
