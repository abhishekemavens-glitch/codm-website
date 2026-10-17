import TableOfContents from "@/components/TableOfContents";
import ExpertForm from "@/components/ExpertForm";
import StickyAside from "@/components/StickyAside";
import CopyCodeButton from "@/components/CopyCodeButton";

/* =========================================================
   BLOG DETAIL SETTINGS
   ========================================================= */

const SITE_URL = "https://codm-frontend.vercel.app";

const YOUTUBE_URL = "https://www.youtube.com/";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/* Frontend route of a single blog post. Related / Previous / Next
   links are built as BLOG_BASE_PATH + "/" + slug.
   CHANGE THIS if your post pages live somewhere else (e.g. "/insights"). */
const BLOG_BASE_PATH = "/blogs";

/* How many related blogs to show */
const RELATED_COUNT = 3;

const normalizeUri = (uri: string) =>
  uri
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/\/+$/, "")
    .toLowerCase();

function blogHref(uri: string) {
  const slug = normalizeUri(uri).split("/").filter(Boolean).pop() ?? "";

  return `${BLOG_BASE_PATH}/${slug}`;
}

type PostExtras = {
  faqs: Faq[];
  related: ListPost[];
  previous: ListPost | null;
  next: ListPost | null;
};

/* One request for everything this page needs beyond the post itself:
   the FAQs, related blogs and previous / next blogs. Matching the
   current post by uri (no nodeByUri) keeps it simple and robust.
   Fails quietly: the sections just don't render, and the reason is
   logged on the server (check the Vercel function logs). */
async function fetchPostExtras(uri: string): Promise<PostExtras> {
  const empty: PostExtras = {
    faqs: [],
    related: [],
    previous: null,
    next: null,
  };

  try {
    const res = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query PostExtras {
            posts(first: 100) {
              nodes {
                databaseId
                title
                uri
                date
                excerpt
                blogFaqs {
                  question
                  answer
                }
                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }
                categories {
                  nodes {
                    databaseId
                    name
                  }
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 60 },
    });

    const json = await res.json();

    if (json.errors) {
      console.error("PostExtras GraphQL error:", json.errors);
      return empty;
    }

    const all: ListPost[] = json?.data?.posts?.nodes ?? [];

    const key = normalizeUri(uri);

    const index = all.findIndex(
      (p) => normalizeUri(p.uri) === key
    );

    if (index === -1) {
      console.error("PostExtras: current post not found for uri", uri);
      return { ...empty, related: all.slice(0, RELATED_COUNT) };
    }

    const current = all[index];

    const others = all.filter((_, i) => i !== index);

    const categoryIds = new Set(
      (current.categories?.nodes ?? []).map((c) => c.databaseId)
    );

    const sameCategory = others.filter((p) =>
      (p.categories?.nodes ?? []).some((c) =>
        categoryIds.has(c.databaseId)
      )
    );

    const remaining = others.filter((p) => !sameCategory.includes(p));

    /* posts come newest first: index - 1 is newer, index + 1 is older.
       Both wrap around, so the buttons always show when 2+ posts exist. */
    const next =
      index > 0
        ? all[index - 1]
        : all.length > 1
        ? all[all.length - 1]
        : null;

    const previous =
      index < all.length - 1
        ? all[index + 1]
        : all.length > 1
        ? all[0]
        : null;

    return {
      faqs: current.blogFaqs ?? [],
      related: [...sameCategory, ...remaining].slice(0, RELATED_COUNT),
      previous,
      next,
    };
  } catch (error) {
    console.error("Failed to load post extras:", error);
    return empty;
  }
}

/* =========================================================
   TYPES
   ========================================================= */

type TocItem = {
  id: string;
  text: string;
};

type Faq = {
  question: string;
  answer: string; // sanitized HTML from WordPress
};

type ListPost = {
  databaseId: number;
  title: string;
  uri: string;
  date: string;
  excerpt: string | null;
  blogFaqs: Faq[] | null;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
  categories: {
    nodes: {
      databaseId: number;
      name: string;
    }[];
  } | null;
};

type BlogPost = {
  blogFaqs?: Faq[] | null;

  /* Per-post code block (e.g. "Integration Framework"), shown after
     the FAQ. Both are optional -- the section just doesn't render
     when either is empty. */
  codeBlockTitle?: string | null;
  codeBlockSnippet?: string | null;

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

/* =========================================================
   FAQ SECTION

   Native <details> accordion (no client JS needed) + FAQPage
   JSON-LD so Google can show the questions in search results.
   ========================================================= */

/* =========================================================
   RELATED BLOGS + PREVIOUS / NEXT
   ========================================================= */

function PostCard({ post }: { post: ListPost }) {
  const img = post.featuredImage?.node;

  const cat = post.categories?.nodes?.[0]?.name;

  const title = decodeEntities(post.title);

   console.log("BLOG CODE BLOCK DEBUG:", {
  postTitle: post.title,
  codeBlockTitle: post.codeBlockTitle,
  codeBlockSnippetLength: post.codeBlockSnippet?.length ?? 0,
});

  return (
    <a href={blogHref(post.uri)} className="codm-related-card">
      <div className="codm-related-media">
        {img?.sourceUrl && (
          <img
            src={img.sourceUrl}
            alt={img.altText || title}
            loading="lazy"
          />
        )}
      </div>

      <div className="codm-related-body">
        {cat && <span className="codm-related-cat">{cat}</span>}

        <h3 className="codm-related-title">{title}</h3>

        <span className="codm-related-date">
          {formatDate(post.date)}
        </span>
      </div>
    </a>
  );
}

function RelatedPosts({ posts }: { posts: ListPost[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      className="codm-post-related"
      aria-labelledby="related-heading"
    >
      <h2 id="related-heading" className="codm-post-related-title">
        Related Blogs
      </h2>

      <div className="codm-related-grid">
        {posts.map((p) => (
          <PostCard key={p.databaseId} post={p} />
        ))}
      </div>
    </section>
  );
}

function PostNav({
  previous,
  next,
}: {
  previous: ListPost | null;
  next: ListPost | null;
}) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav className="codm-post-nav" aria-label="More blogs">
      {previous ? (
        <a
          href={blogHref(previous.uri)}
          className="codm-post-nav-link codm-post-nav-prev"
        >
          <span className="codm-post-nav-label">
            &larr; Previous blog
          </span>

          <span className="codm-post-nav-title">
            {decodeEntities(previous.title)}
          </span>
        </a>
      ) : (
        <span />
      )}

      {next ? (
        <a
          href={blogHref(next.uri)}
          className="codm-post-nav-link codm-post-nav-next"
        >
          <span className="codm-post-nav-label">
            Next blog &rarr;
          </span>

          <span className="codm-post-nav-title">
            {decodeEntities(next.title)}
          </span>
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}

function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: decodeEntities(stripTags(faq.answer)).trim(),
      },
    })),
  };

  return (
    <section
      id="faqs"
      className="codm-post-faq"
      aria-labelledby="faqs-heading"
    >
      <h2 id="faqs-heading" className="codm-post-faq-title">
        Frequently Asked Questions
      </h2>

      <div className="codm-post-faq-list">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="codm-post-faq-item"
            open={index === 0}
          >
            <summary className="codm-post-faq-question">
              <span>{faq.question}</span>
              <span
                className="codm-post-faq-icon"
                aria-hidden="true"
              />
            </summary>

            <div
              className="codm-post-faq-answer"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </details>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  );
}

/* =========================================================
   CODE BLOCK SECTION (e.g. "Integration Framework")

   Per-post, optional. Renders only when both a title and a
   snippet are set in WordPress. Shown right after the FAQ.
   ========================================================= */

function CodeBlockSection({
  title,
  code,
}: {
  title?: string | null;
  code?: string | null;
}) {
  if (!title || !code) {
    return null;
  }

  return (
    <section className="codm-post-codeblock" aria-labelledby="codeblock-heading">
      <div className="codm-post-codeblock-header">
        <h2 id="codeblock-heading" className="codm-post-codeblock-title">
          {title}
        </h2>

        <CopyCodeButton code={code} />
      </div>

      <pre className="codm-post-codeblock-pre">
        <code>{code}</code>
      </pre>
    </section>
  );
}

export default async function BlogPostDetail({
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
    items: headingItems,
  } = buildToc(content);

  const extras = await fetchPostExtras(post.uri);

  const rawFaqs =
    post.blogFaqs !== undefined
      ? post.blogFaqs ?? []
      : extras.faqs;

  const faqs = rawFaqs.filter(
    (faq) => faq?.question?.trim() && faq?.answer?.trim()
  );

  const items: TocItem[] =
    faqs.length > 0
      ? [
          ...headingItems,
          { id: "faqs", text: "Frequently Asked Questions" },
        ]
      : headingItems;

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

          {/* FAQ */}

          <FaqSection faqs={faqs} />

          {/* INTEGRATION FRAMEWORK / CODE BLOCK -- shown after the FAQ */}

          <CodeBlockSection
            title={post.codeBlockTitle}
            code={post.codeBlockSnippet}
          />

          {/* TALK TO OUR EXPERTS -- moved here from the sidebar,
              so it now sits after the FAQ / code block */}

          <ExpertForm />

          {/* PREVIOUS / NEXT */}

          <PostNav
            previous={extras.previous}
            next={extras.next}
          />

        </article>

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <StickyAside className="codm-post-aside">
          <div className="codm-post-aside-sticky">

          {/* TOC */}

          {items.length > 0 && (
            <TableOfContents
              items={items}
            />
          )}

          </div>

        </StickyAside>

      </div>


      {/* RELATED BLOGS */}

      <RelatedPosts posts={extras.related} />

    </div>
  );
}
