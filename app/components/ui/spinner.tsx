import { cn } from "cn"
import { Loader2Icon } from "lucide-react"

/*
 * Loader2Icon 自己管理 SVG ref；原生 svg 的 ComponentProps 同时包含已废弃的 string ref，
 * 直接展开会与 Lucide 的 ForwardRef 类型冲突。排除 ref 后其余 SVG 属性仍可完整透传，
 * 不会影响 Spinner 的尺寸、动画、无障碍属性或调用方式。
 */
function Spinner({ className, ...props }: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <Loader2Icon data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
