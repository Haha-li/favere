import { getAllPosts, postUrl } from "@/lib/posts";

export async function GET() {
  const posts = await getAllPosts();
  const payload = {
    posts: posts.map((post) => ({
      id: post.id,
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate.toISOString(),
      tags: post.data.tags,
      cover: post.data.cover,
      url: postUrl(post)
    }))
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

