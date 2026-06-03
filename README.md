# Favere Blog

Astro + Tailwind CSS 4 的个人博客前台，内置 Markdown/MDX 内容层、标签、归档、RSS、Sitemap、静态搜索和 JSON API。

## 技术栈

- Astro：页面、内容集合、静态构建与 API endpoint
- Tailwind CSS 4：轻量 UI 与响应式布局
- MDX：文章中嵌入组件
- Pagefind：构建后生成本地搜索索引
- Giscus/Halo 等评论或 CMS 可后续接入

## 本地运行

```bash
npm install
npm run dev
```

## 本地内容编辑

项目集成了 Keystatic，但默认不会启用编辑入口。需要编辑文章时，在本机显式开启：

```bash
$env:ENABLE_KEYSTATIC="true"
npm run dev
```

然后访问 `/keystatic`。当前 Keystatic 使用 local storage，只适合本机编辑；不要把开启了 Keystatic 的 dev server 暴露到公网或共享给不可信网络。生产构建不会加载 Keystatic。

## 构建

```bash
npm run build
npm run preview
```

构建后会自动运行 Pagefind，为 `dist/` 生成搜索索引。

## 部署前调整

1. 将 `astro.config.mjs` 里的 `site` 改成你的真实域名。
2. 修改 `src/consts.ts` 中的站点标题、作者和社交链接。
3. 在 `src/content/blog/` 中新增或迁移文章。
