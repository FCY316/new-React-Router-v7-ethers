// 此包未附带类型，仅声明项目实际使用的头像生成 API。
declare module "ethereum-blockies" {
  const blockies: { create(options: { seed: string; size?: number; scale?: number; color?: string; bgcolor?: string; spotcolor?: string }): HTMLCanvasElement };
  export default blockies;
}
