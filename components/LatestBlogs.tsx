const blogs = [
  {
    categories: ["Higher Education", "Education Cloud", "Experience Cloud"],
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80",
    title:
      "From a fragmented admissions journey to one connected Salesforce experience.",
  },
  {
    categories: ["Nonprofit", "Implementation"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
    title:
      "A Salesforce foundation built for a nonprofit's real operating model — not a generic template.",
  },
  {
    categories: ["Financial Services", "FSC", "Experience Cloud"],
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80",
    title:
      "From a fragmented admissions journey to one connected Salesforce experience.",
  },
];

export default function LatestBlogs() {
  return (
    <section className="latest-blogs">
      <div className="latest-blogs-header">
        <div className="section-label">
          <span />
          FROM BLOG
          <span />
        </div>

        <h2>
          Our <strong>Latest Blogs</strong>
        </h2>

        <p>Explore the insights and trends shaping our industry</p>
      </div>

      <div className="latest-blogs-grid">
        {blogs.map((blog, index) => (
          <article className="blog-card" key={index}>
            <div className="blog-categories">
              {blog.categories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>

            <div className="blog-image">
              <img src={blog.image} alt={blog.title} />
            </div>

            <h3>{blog.title}</h3>

            <a href="#">
              View case study <span>→</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
