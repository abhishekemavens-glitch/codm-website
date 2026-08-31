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
