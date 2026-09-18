import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';

/**
 * 集中挂载 shadcn/ui 所需的应用级能力。
 *
 * ThemeProvider 是 next-themes 提供的官方主题上下文，Sonner 直接使用它决定亮/暗提示外观；
 * Toaster 仍只挂载一次，页面不需要各自放置提示容器。
 */
const StyleProviderCom = ({ children }: { children: React.ReactNode }) => {

    return (
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
            {/*
              全局提示只挂载一次。业务层通过 sonner 的 toast.success/warning/error 调用，
              不必把提示容器重复放入页面或弹窗内。
            */}
            <Toaster
                closeButton
                duration={4000}
                mobileOffset={{
                    top: 'max(1rem, env(safe-area-inset-top))',
                    left: '1rem',
                    right: '1rem',
                }}
                position="top-center"
                visibleToasts={2}
            />
            {children}
        </ThemeProvider>
    )
}

// 导出样式提供者组件作为默认导出
export default StyleProviderCom
