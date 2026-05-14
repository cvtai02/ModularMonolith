import Link from "next/link";
import { marked } from "marked";
import { ContentClient } from "@modular-monolith/clients-shared/api/clients";
import { appFetch } from "@/app/configs/appFetch";
import { resolveMediaUrl } from "@/app/lib/media";
import { BlogSidebar, type BlogSidebarGroup } from "@/app/components/blog-sidebar";
import "../../landing.css";
import "./blog-sidebar.css";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const client = new ContentClient(appFetch, process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

  const [post, collections] = await Promise.all([
    client.getPublishedBlogPostBySlug(decodedSlug).catch(() => null),
    client.listPublicBlogPostCollections({ pageSize: 100 }).catch(() => null),
  ]);

  if (!post) {
    return (
      <div className="landing-root" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--brown-md)" }}>Blog post not found.</p>
      </div>
    );
  }

  const coverUrl = post.imageKey ? resolveMediaUrl(post.imageKey) : null;
  const contentHtml = (await marked(post.content, { breaks: true }))
    .replace(/^<h1[^>]*>[\s\S]*?<\/h1>\n?/i, "");

  // Map public collections → sidebar groups. Skip collections with no posts.
  const sidebarGroups: BlogSidebarGroup[] = (collections?.items ?? [])
    .filter((c) => c.items.length > 0)
    .map((c) => ({
      title: c.title,
      posts: c.items.map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
    }));

  return (
    <div className="landing-root">
      <div className="site-logo-bar">
        <Link href="/" className="site-logo">
          <img src="/nekomin.svg" alt="Nekomin" width={108} height={108} />
        </Link>
        <span className="site-section-label" style={{ background: "oklch(97% 0.018 68)", borderRadius: 20, padding: "2px 14px 4px" }}>{post.title}</span>
      </div>

      <BlogSidebar groups={sidebarGroups} currentSlug={decodedSlug} />

      <article style={{ padding: "100px 32px 80px", maxWidth: 760, margin: "0 auto" }}>
        {post.summary && (
          <p style={{ fontSize: "1.05rem", color: "var(--brown-md)", fontStyle: "italic", lineHeight: 1.7, marginBottom: 32, paddingLeft: 16, borderLeft: "2px solid var(--terra)" }}>
            {post.summary}
          </p>
        )}

        <div
          className="blog-content"
          style={{ fontSize: "1rem", color: "var(--brown-dk)", lineHeight: 1.85 }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {coverUrl && (
          <div style={{ marginTop: 48, borderRadius: 18, overflow: "hidden" }}>
            <img
              src={coverUrl}
              alt={post.title}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        )}
      </article>
    </div>
  );
}
