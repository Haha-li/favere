import { PROFILE } from "@/consts";

/**
 * 计算站点从 PROFILE.startedAt 起至今的运行天数。
 * 向上取整（不满一天算一天），保底 1 天，防止启动当天或时区偏差显示 0。
 * 在 SSR 渲染时按请求时刻计算，无需重新构建即可自然增长。
 */
export function getRunDays(from: string = PROFILE.startedAt): number {
  const startDate = new Date(from);
  const diffMs = Math.abs(Date.now() - startDate.getTime());
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
