import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  ui: {
    brand: {
      name: 'Favere Notes 创意工作台',
    }
  },
  collections: {
    blog: collection({
      label: '博客文章 Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      entryLayout: 'content',
      format: {
        data: 'yaml',
        contentField: 'content',
      },
      schema: {
        title: fields.slug({ name: { label: '标题 Title' } }),
        description: fields.text({ label: '摘要 Description', multiline: true }),
        pubDate: fields.date({ label: '发布日期 Date', defaultValue: { kind: 'today' } }),
        tags: fields.array(fields.text({ label: '标签 Tag' }), {
          label: '标签列表 Tags',
          itemLabel: (props) => props.value || '新标签',
        }),
        cover: fields.image({
          label: '封面图片 Cover Image',
          directory: 'public/images/blog',
          publicPath: '/images/blog/',
        }),
        draft: fields.checkbox({ label: '草稿 Draft', defaultValue: false }),
        content: fields.mdx({
          label: '正文 Content',
        }),
      },
    }),
  },
});
