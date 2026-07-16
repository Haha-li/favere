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
  email: "",
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
  statusText: "运行实验中",
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
  { href: "/lab/", label: "实验" },
  { href: "/blog/", label: "文章" },
  { href: "/tags/", label: "标签" },
  { href: "/archive/", label: "归档" },
  { href: "/friends/", label: "友链" }
];

/** 友链分类：用于筛选与卡片色标 */
export type FriendCategory = "blog" | "community" | "tool" | "other";

export type FriendLink = {
  name: string;
  url: string;
  description: string;
  /** 头像；缺省时用站点 favicon */
  avatar?: string;
  category?: FriendCategory;
};

export const FRIEND_CATEGORIES: Record<
  FriendCategory,
  { label: string; hint: string }
> = {
  blog: { label: "博客", hint: "个人站点与写作" },
  community: { label: "社区", hint: "论坛与讨论区" },
  tool: { label: "工具", hint: "效率与开发工具" },
  other: { label: "其他", hint: "值得一提的连接" }
};

/**
 * 友链列表：在这里维护即可，页面会自动渲染。
 * avatar 可省略，会回退到 DuckDuckGo IP 图标。
 */
export const FRIENDS: FriendLink[] = [
  {
    name: "Linux.do",
    url: "https://linux.do/",
    description: "真实有趣、有用的社区，记录与交流的好去处。",
    avatar: "https://icons.duckduckgo.com/ip3/linux.do.ico",
    category: "community"
  },
  {
    name: "Astro",
    url: "https://astro.build/",
    description: "本站基于 Astro 构建的内容站点框架。",
    avatar: "https://icons.duckduckgo.com/ip3/astro.build.ico",
    category: "tool"
  },
  {
    name: "Cloudflare",
    url: "https://www.cloudflare.com/",
    description: "边缘网络与 Workers 部署所在。",
    avatar: "https://icons.duckduckgo.com/ip3/cloudflare.com.ico",
    category: "tool"
  }
];

/** 申请友链时展示的本站信息 */
export const FRIEND_EXCHANGE = {
  name: SITE.title,
  url: SITE.url,
  description: SITE.description,
  avatar: PROFILE.avatarUrl,
  email: SITE.email
} as const;
