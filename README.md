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

## 内容编辑

项目集成了 Keystatic。默认情况下：

- 本地开发使用 `local` storage，文章直接写入本机文件。
- 生产构建使用 `github` storage，线上保存会提交到 `Haha-li/favere`，再触发 Cloudflare Pages 重新部署。

本地运行后访问 `/keystatic`：

```bash
npm run dev
```

生产构建会强制使用 `github` storage，避免把本地 `.env` 中的 `local` 模式带到线上。如需在本地测试 GitHub storage，可临时设置：

```bash
$env:PUBLIC_KEYSTATIC_STORAGE_KIND="github"
npm run dev
```

不要使用 `KEYSTATIC_STORAGE_KIND` 切换 storage；Keystatic 配置会同时被浏览器和服务端加载，必须使用 `PUBLIC_KEYSTATIC_STORAGE_KIND` 才能保持两边一致。

生产环境需要把 Keystatic GitHub App 生成的环境变量配置到 Cloudflare 项目：

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
- `KEYSTATIC_ADMIN_PASSWORD`

`KEYSTATIC_ADMIN_PASSWORD` 是项目内置后台门禁的管理员密码。访问 `/keystatic` 或 `/api/keystatic/*` 前会先跳转到 `/admin-login`，登录成功后才会放行。密码不要提交到 Git，线上请配置为 Cloudflare Worker 环境变量；本地开发可放在 `.env` 中。

如果某个环境需要隐藏后台，可设置：

```bash
SKIP_KEYSTATIC=true
```

线上使用 `/keystatic` 需要服务端路由。Astro 6 的 Cloudflare adapter 面向 Cloudflare Workers；如果只部署到 Cloudflare Pages 静态站点，博客前台可以正常访问，但 Keystatic 后台不会完整工作。

Cloudflare Workers 还需要一个名为 `SESSION` 的 KV binding，用于保存后台登录会话。构建产物会在 `dist/server/wrangler.json` 中声明该绑定；如果你在 Cloudflare 控制台手动配置，绑定名也必须保持为 `SESSION`。

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
