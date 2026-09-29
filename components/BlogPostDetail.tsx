import TableOfContents from "@/components/TableOfContents";
import ExpertForm from "@/components/ExpertForm";
 
/* =========================================================
   BLOG DETAIL SETTINGS
   ========================================================= */

const SITE_URL = "https://codm-frontend.vercel.app";

const YOUTUBE_URL = "https://www.youtube.com/";

/* =========================================================
   TYPES
   ========================================================= */

type TocItem = {
  id: string;
  text: string;
};

type BlogPost = {
  title: string;

  excerpt: string | null;

  uri: string;

  date: string;

  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;

  categories: {
    nodes: {
      name: string;
    }[];
  } | null;

  author?: {
    node?: {
      name?: string | null;

      avatar?: {
        url?: string | null;
      } | null;
    } | null;
  } | null;
};

/* =========================================================
   HELPERS
   ========================================================= */

function stripTags(html: string) {
  return html.replace(/<[^>]*>/g, "");
}

function decodeEntities(text: string) {
  return text
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, hex: string) =>
        String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(
      /&#(\d+);/g,
      (_, dec: string) =>
        String.fromCodePoint(parseInt(dec, 10))
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\[?&hellip;\]?/g, "…");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

function readMinutes(html: string) {
  const words = stripTags(html)
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(
    1,
    Math.ceil(words / 200)
  );
}

/* =========================================================
   BUILD TABLE OF CONTENTS

   Supports H2 + H3.

   Existing IDs are preserved.
   New IDs are generated automatically.
   ========================================================= */

function buildToc(
  html: string
): {
  html: string;
  items: TocItem[];
} {
  const items: TocItem[] = [];

  const used = new Set<string>();

  const output = html.replace(
    /<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (
      match: string,
      tag: string,
      attrs: string,
      inner: string
    ) => {
      const text = decodeEntities(
        stripTags(inner)
      ).trim();

      if (!text) {
        return match;
      }

      const existing = attrs.match(
        /\sid=["']([^"']+)["']/i
      );

      if (existing) {
        const id = existing[1];

        used.add(id);

        items.push({
          id,
          text,
        });

        return match;
      }

      const base =
        slugify(text) ||
        `section-${items.length + 1}`;

      let id = base;

      let counter = 2;

      while (used.has(id)) {
        id = `${base}-${counter++}`;
      }

      used.add(id);

      items.push({
        id,
        text,
      });

      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    }
  );

  return {
    html: output,
    items,
  };
}

/* =========================================================
   ICONS
   ========================================================= */

function XIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* =========================================================
   BLOG POST DETAIL
   ========================================================= */

export default function BlogPostDetail({
  post,
  content,
}: {
  post: BlogPost;
  content: string;
}) {
  const image =
    post.featuredImage?.node;

  const category =
    post.categories?.nodes?.[0]?.name;

  const authorName =
    post.author?.node?.name;

  const avatarUrl =
    post.author?.node?.avatar?.url;

  const title =
    decodeEntities(post.title);

  const excerpt =
    decodeEntities(
      stripTags(post.excerpt ?? "")
    ).trim();

  const minutes =
    readMinutes(content);

  const {
    html,
    items,
  } = buildToc(content);

  const shareUrl =
    encodeURIComponent(
      `${SITE_URL}${post.uri}`
    );

  const shareText =
    encodeURIComponent(title);

  return (
    <div className="codm-post">

      <div className="codm-post-layout">

        {/* =================================================
            MAIN ARTICLE
        ================================================= */}

        <article className="codm-post-main">

          {/* DATE / READ TIME */}

          <div className="codm-post-meta">
            <span>
              {formatDate(post.date)}
            </span>

            <span aria-hidden="true">
              •
            </span>

            <span>
              {minutes} min read
            </span>
          </div>

          {/* TITLE */}

          <h1 className="codm-post-title">
            {title}
          </h1>

          {/* EXCERPT */}

          {excerpt && (
            <p className="codm-post-excerpt">
              {excerpt}
            </p>
          )}

          {/* AUTHOR + SHARE */}

          <div className="codm-post-byline">

            <div className="codm-post-author">

              {authorName && (
                <>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="codm-post-avatar"
                    />
                  ) : (
                    <span className="codm-post-avatar codm-post-avatar-fallback">
                      {authorName
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                  <span>
                    By {authorName}
                  </span>
                </>
              )}

              {authorName &&
                category && (
                  <span
                    className="codm-post-sep"
                    aria-hidden="true"
                  />
                )}

              {category && (
                <span>
                  {category}
                </span>
              )}

            </div>

            {/* SHARE */}

            <div className="codm-post-share">

              <span>
                Share:
              </span>

              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
              >
                <XIcon />
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
              >
                <LinkedInIcon />
              </a>

              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="CODM on YouTube"
              >
                <YouTubeIcon />
              </a>

            </div>

          </div>

          {/* HERO */}

          {image?.sourceUrl && (
            <div className="codm-post-hero">

              <img
                src={image.sourceUrl}
                alt={
                  image.altText ||
                  title
                }
              />

            </div>
          )}

          {/* WORDPRESS CONTENT */}

          {html && (
            <div
              className="codm-post-content"
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />
          )}

        </article>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="codm-post-aside">

          {/* TOC */}

          {items.length > 0 && (
            <TableOfContents
              items={items}
            />
          )}

          {/* EXPERT FORM */}

          <ExpertForm />

        </aside>

      </div>

    </div>
  );
}
