"use client";

import { useState } from "react";
import type { BlogPostSummary } from "@modular-monolith/clients-shared/api/types/content";

export type BlogSidebarGroup = {
  /** Collection title. Omit for an ungrouped flat list. */
  title?: string;
  posts: Pick<BlogPostSummary, "id" | "title" | "slug">[];
};

/**
 * Hover-reveal sidebar for blog post detail pages.
 *
 * Default state: a small pulsing glow orb at the right edge.
 * Hover state: a full sidebar panel slides in showing collection → posts navigation.
 *
 * Collections accordion: one open at a time, expand/collapse animated via
 * CSS grid-template-rows 0fr → 1fr trick.
 */
export function BlogSidebar({
  groups,
  currentSlug,
}: {
  groups: BlogSidebarGroup[];
  currentSlug: string;
}) {
  const hasContent = groups.some((g) => g.posts.length > 0);

  const defaultOpen = () => {
    const idx = groups.findIndex((g) => g.posts.some((p) => p.slug === currentSlug));
    return idx >= 0 ? idx : 0;
  };

  const [openIdx, setOpenIdx] = useState<number>(defaultOpen);

  if (!hasContent) return null;

  return (
    <div className="blog-sidebar">
      <span className="blog-sidebar-orb" aria-hidden="true" />
      <nav className="blog-sidebar-panel" aria-label="Danh sách bài viết">
        <div className="blog-sidebar-inner">
          <div className="blog-sidebar-heading">Bài viết</div>
          {groups.map((group, gi) => {
            const isOpen = gi === openIdx;
            return (
              <div key={gi} className="blog-sidebar-section">
                {group.title && (
                  <button
                    type="button"
                    className={`blog-sidebar-section-title${isOpen ? " open" : ""}`}
                    aria-expanded={isOpen}
                    onClick={() => setOpenIdx(isOpen ? -1 : gi)}
                  >
                    {group.title}
                    <span className="blog-sidebar-chevron" aria-hidden="true" />
                  </button>
                )}
                <div className={`blog-sidebar-list-wrap${isOpen ? " open" : ""}`}>
                  <ul className="blog-sidebar-list">
                    {group.posts.map((post) => (
                      <li
                        key={post.id}
                        className={`blog-sidebar-item${post.slug === currentSlug ? " active" : ""}`}
                      >
                        <a href={`/blog/${post.slug}`} title={post.title}>
                          {post.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
