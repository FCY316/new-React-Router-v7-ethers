import { Link } from "react-router";

/**
 * /about 页面。
 * 此页面会渲染到 Layout 组件的 <Outlet /> 位置，
 * 因此会自动保留公共 Header 和 Foot。
 */
export default function AboutPage() {
    return (
        <main className="px-4 py-6">
            <h1 className="text-xl font-semibold">关于我们</h1>

            <Link className="mt-4 inline-block underline" to="/">
                返回首页
            </Link>
        </main>
    );
}