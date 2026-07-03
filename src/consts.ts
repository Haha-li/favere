// 站点品牌、作者、社交链接、后台与个人卡片信息统一从这里维护。
export const SITE = {
  title: "huhuya Notes",
  shortName: "huhuya",
  description: "记录技术、产品、生活与长期主义的个人博客。",
  author: "Huhuya",
  url: "https://livvvi.com",
  locale: "zh-CN",
  brandInitial: "H",
  github: "https://github.com/Haha-li/favere",
  email: "hello@example.com",
  serviceName: "favere-blog"
} as const;

export const REPOSITORY = {
  github: "Haha-li/favere"
} as const;

export const CMS = {
  brandName: `${SITE.title} 创意工作台`,
  loginTitle: `后台登录 | ${SITE.title}`,
  footerName: `${SITE.title} CMS`
} as const;

export const MANIFEST = {
  backgroundColor: "#fbfbf8",
  themeColor: "#171717"
} as const;

export const PROFILE = {
  displayName: "Huhuya",
  role: "AI操作者 / 记录者",
  statusText: "浇灌数据库",
  badgeId: "#05E95DD8",
  startedAt: "2026-05-20",
  avatarUrl: "https://cdn.ldstatic.com/user_avatar/linux.do/huhuya/144/641328_2.png",
  links: {
    linuxDo: {
      href: "https://linux.do/u/huhuya",
      title: "linuxDo",
      icon: "https://icons.duckduckgo.com/ip3/linux.do.ico"
    }
  }
} as const;

export const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/blog/", label: "文章" },
  { href: "/tags/", label: "标签" },
  { href: "/archive/", label: "归档" },
  { href: "/about/", label: "关于" }
];
