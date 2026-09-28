type TocItem = {
  id: string;
  text: string;
};

export default function TableOfContents({
  items,
}: {
  items: TocItem[];
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="codm-toc">
      <h3>Table of Contents</h3>

      <div className="codm-toc-list">
        {items.map((item, index) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="codm-toc-item"
          >
            <span className="codm-toc-number">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="codm-toc-text">
              {item.text}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
