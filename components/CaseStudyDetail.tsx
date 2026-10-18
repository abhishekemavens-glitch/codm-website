import TableOfContents from "@/components/TableOfContents";
import ExpertForm from "@/components/ExpertForm";
import StickyAside from "@/components/StickyAside";
import CopyCodeButton from "@/components/CopyCodeButton";

/* =========================================================
   CASE STUDY DETAIL SETTINGS

   Mirrors BlogPostDetail.tsx: FAQ accordion, optional code
   block, and related case studies, pointed at the "caseStudies"
   WPGraphQL type instead of "posts".
   ========================================================= */

const SITE_URL = "https://codm-frontend.vercel.app";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/* Frontend route of a single case study. Matches the "case-studies"
   rewrite slug set on the Case Study post type in WordPress. */
const CASE_STUDY_BASE_PATH = "/case-studies";

const RELATED_COUNT = 3;

const normalizeUri = (uri: string) =>
  uri
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/\/+$/, "")
    .toLowerCase();

function caseStudyHref(uri: string) {
  const slug = normalizeUri(uri).split("/").filter(Boolean).pop() ?? "";
  return `${CASE_STUDY_BASE_PATH}/${slug}`;
}

type Faq = {
  question: string;
  answer: string;
};

type ListCaseStudy = {
  databaseId: number;
  title: string;
  uri: string;
  date: string;
  excerpt: string | null;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
  categories: {
    nodes: { databaseId: number; name: string }[];
  } | null;
};

type CaseStudyExtras = {
  related: ListCaseStudy[];
  previous: ListCaseStudy | null;
  next: ListCaseStudy | null;
};

async function fetchCaseStudyExtras(
  uri: string
): Promise<CaseStudyExtras> {
  const empty: CaseStudyExtras = { related: [], previous: null, next: null };

  try {
    const res = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query CaseStudyExtras {
            caseStudies(first: 100) {
              nodes {
                databaseId
                title
                uri
                date
                excerpt
                featuredImage {
                  node {
                    ... on MediaItem {
                      sourceUrl
                      altText
                    }
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
      console.error("CaseStudyExtras GraphQL error:", json.errors);
      return empty;
    }

    const all: ListCaseStudy[] = json?.data?.caseStudies?.nodes ?? [];
    const key = normalizeUri(uri);
    const index = all.findIndex((p) => normalizeUri(p.uri) === key);

    if (index === -1) {
      return { ...empty, related: all.slice(0, RELATED_COUNT) };
    }

    const current = all[index];
    const others = all.filter((_, i) => i !== index);

    const categoryIds = new Set(
      (current.categories?.nodes ?? []).map((c) => c.databaseId)
    );

    const sameCategory = others.filter((p) =>
      (p.categories?.nodes ?? []).some((c) => categoryIds.has(c.databaseId))
    );

    const remaining = others.filter((p) => !sameCategory.includes(p));

    const next =
      index > 0 ? all[index - 1] : all.length > 1 ? all[all.length - 1] : null;

    const previous =
      index < all.length - 1
        ? all[index + 1]
        : all.length > 1
        ? all[0]
        : null;

    return {
      related: [...sameCategory, ...remaining].slice(0, RELATED_COUNT),
      previous,
      next,
    };
  } catch (error) {
    console.error("Failed to load case study extras:", error);
    return empty;
  }
}

type CaseStudy = {
  caseStudyFaqs?: Faq[] | null;
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
    nodes: { name: string }[];
  } | null;

  author?: {
    node?: {
      name?: string | null;
      avatar?: { url?: string | null } | null;
    } | null;
  } | null;
};

/* =========================================================
   HELPERS (same as BlogPostDetail.tsx)
   ========================================================= */

function stripTags(html: string) {
  return html.replace(/<[^>]*>/g, "");
}

function decodeEntities(text: string) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
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
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function readMinutes(html: string) {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

type TocItem = { id: string; text: string };

function buildToc(html: string): { html: string; items: TocItem[] } {
  const items: TocItem[] = [];
  const used = new Set<string>();

  const output = html.replace(
    /<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match: string, tag: string, attrs: string, inner: string) => {
      const text = decodeEntities(stripTags(inner)).trim();
      if (!text) return match;

      const existing = attrs.match(/\sid=["']([^"']+)["']/i);
      if (existing) {
        used.add(existing[1]);
        items.push({ id: existing[1], text });
        return match;
      }

      const base = slugify(text) || `section-${items.length + 1}`;
      let id = base;
      let counter = 2;
      while (used.has(id)) id = `${base}-${counter++}`;
      used.add(id);
      items.push({ id, text });

      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    }
  );

  return { html: output, items };
}

/* =========================================================
   RELATED CASE STUDIES + PREVIOUS / NEXT
   ========================================================= */

function CaseStudyCard({ item }: { item: ListCaseStudy }) {
  const img = item.featuredImage?.node;
  const cat = item.categories?.nodes?.[0]?.name;
  const title = decodeEntities(item.title);

  return (
    <a href={caseStudyHref(item.uri)} className="codm-related-card">
      <div className="codm-related-media">
        {img?.sourceUrl && (
          <img src={img.sourceUrl} alt={img.altText || title} loading="lazy" />
        )}
      </div>

      <div className="codm-related-body">
        {cat && <span className="codm-related-cat">{cat}</span>}
        <h3 className="codm-related-title">{title}</h3>
        <span className="codm-related-date">{formatDate(item.date)}</span>
      </div>
    </a>
  );
}

function RelatedCaseStudies({ items }: { items: ListCaseStudy[] }) {
  if (items.length === 0) return null;

  return (
    <section className="codm-post-related" aria-labelledby="related-heading">
      <h2 id="related-heading" className="codm-post-related-title">
        Related Case Studies
      </h2>

      <div className="codm-related-grid">
        {items.map((item) => (
          <CaseStudyCard key={item.databaseId} item={item} />
        ))}
      </div>
    </section>
  );
}

function CaseStudyNav({
  previous,
  next,
}: {
  previous: ListCaseStudy | null;
  next: ListCaseStudy | null;
}) {
  if (!previous && !next) return null;

  return (
    <nav className="codm-post-nav" aria-label="More case studies">
      {previous ? (
        <a
          href={caseStudyHref(previous.uri)}
          className="codm-post-nav-link codm-post-nav-prev"
        >
          <span className="codm-post-nav-label">&larr; Previous case study</span>
          <span className="codm-post-nav-title">
            {decodeEntities(previous.title)}
          </span>
        </a>
      ) : (
        <span />
      )}

      {next ? (
        <a
          href={caseStudyHref(next.uri)}
          className="codm-post-nav-link codm-post-nav-next"
        >
          <span className="codm-post-nav-label">Next case study &rarr;</span>
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
  if (faqs.length === 0) return null;

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
    <section id="faqs" className="codm-post-faq" aria-labelledby="faqs-heading">
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
              <span className="codm-post-faq-icon" aria-hidden="true" />
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

function CodeBlockSection({
  title,
  code,
}: {
  title?: string | null;
  code?: string | null;
}) {
  if (!title || !code) return null;

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

export default async function CaseStudyDetail({
  caseStudy,
  content,
}: {
  caseStudy: CaseStudy;
  content: string;
}) {
  const image = caseStudy.featuredImage?.node;
  const category = caseStudy.categories?.nodes?.[0]?.name;
  const authorName = caseStudy.author?.node?.name;
  const avatarUrl = caseStudy.author?.node?.avatar?.url;

  const title = decodeEntities(caseStudy.title);
  const excerpt = decodeEntities(stripTags(caseStudy.excerpt ?? "")).trim();
  const minutes = readMinutes(content);

  const { html, items: headingItems } = buildToc(content);

  const extras = await fetchCaseStudyExtras(caseStudy.uri);

  const faqs = (caseStudy.caseStudyFaqs ?? []).filter(
    (faq) => faq?.question?.trim() && faq?.answer?.trim()
  );

  const items: TocItem[] =
    faqs.length > 0
      ? [...headingItems, { id: "faqs", text: "Frequently Asked Questions" }]
      : headingItems;

  const shareUrl = encodeURIComponent(`${SITE_URL}${caseStudy.uri}`);
  const shareText = encodeURIComponent(title);

  return (
    <div className="codm-post">
      <div className="codm-post-layout">
        <article className="codm-post-main">
          <div className="codm-post-meta">
            <span>{formatDate(caseStudy.date)}</span>
            <span aria-hidden="true">•</span>
            <span>{minutes} min read</span>
          </div>

          <h1 className="codm-post-title">{title}</h1>

          {excerpt && <p className="codm-post-excerpt">{excerpt}</p>}

          <div className="codm-post-byline">
            <div className="codm-post-author">
              {authorName && (
                <>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="codm-post-avatar" />
                  ) : (
                    <span className="codm-post-avatar codm-post-avatar-fallback">
                      {authorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span>By {authorName}</span>
                </>
              )}

              {authorName && category && (
                <span className="codm-post-sep" aria-hidden="true" />
              )}

              {category && <span>{category}</span>}
            </div>

            <div className="codm-post-share">
              <span>Share:</span>

              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {image?.sourceUrl && (
            <div className="codm-post-hero">
              <img src={image.sourceUrl} alt={image.altText || title} />
            </div>
          )}

          {html && (
            <div
              className="codm-post-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          <FaqSection faqs={faqs} />

          <CodeBlockSection
            title={caseStudy.codeBlockTitle}
            code={caseStudy.codeBlockSnippet}
          />

          <ExpertForm />

          <CaseStudyNav previous={extras.previous} next={extras.next} />
        </article>

        <StickyAside className="codm-post-aside">
          <div className="codm-post-aside-sticky">
            {items.length > 0 && <TableOfContents items={items} />}
          </div>
        </StickyAside>
      </div>

      <RelatedCaseStudies items={extras.related} />
    </div>
  );
}
