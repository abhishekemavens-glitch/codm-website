
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

      <style jsx>{`
        .latest-blogs {
          width: 100%;
          padding: 110px 7%;
          background: #070918;
          color: #fff;
        }

        .latest-blogs-header {
          text-align: center;
          max-width: 850px;
          margin: 0 auto 48px;
        }

        .section-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
          font-size: 13px;
          letter-spacing: 1px;
          color: #eeeef7;
        }

        .section-label span {
          width: 70px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #7466db
          );
        }

        .section-label span:last-child {
          background: linear-gradient(
            90deg,
            #7466db,
            transparent
          );
        }

        .latest-blogs-header h2 {
          margin: 0;
          font-size: clamp(42px, 5vw, 60px);
          line-height: 1.1;
          font-weight: 400;
          letter-spacing: -2px;
        }

        .latest-blogs-header h2 strong {
          font-weight: 400;
          background: linear-gradient(
            90deg,
            #c7bcff,
            #7969ed
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .latest-blogs-header p {
          margin: 22px 0 0;
          color: #a7adbf;
          font-size: 20px;
        }

        .latest-blogs-grid {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .blog-card {
          background: #15182c;
          border-radius: 14px;
          padding: 24px 32px 28px;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          transition:
            transform 0.3s ease,
            border-color 0.3s ease;
        }

        .blog-card:hover {
          transform: translateY(-5px);
          border-color: rgba(126, 107, 239, 0.35);
        }

        .blog-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          min-height: 70px;
          align-content: flex-start;
        }

        .blog-categories span {
          border: 1px solid #424762;
          color: #9da5bb;
          padding: 6px 10px;
          font-size: 14px;
          line-height: 1;
        }

        .blog-image {
          width: 100%;
          height: 210px;
          overflow: hidden;
          border-radius: 9px;
          margin-bottom: 18px;
        }

        .blog-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .blog-card:hover .blog-image img {
          transform: scale(1.04);
        }

        .blog-card h3 {
          margin: 0;
          color: #d5d8e4;
          font-size: 19px;
          line-height: 1.4;
          font-weight: 400;
        }

        .blog-card a {
          margin-top: auto;
          padding-top: 28px;
          text-decoration: none;
          color: #727a91;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .blog-card a:hover {
          color: #9a8cff;
        }

        .blog-card a span {
          font-size: 22px;
        }

        @media (max-width: 900px) {
          .latest-blogs {
            padding: 80px 5%;
          }

          .latest-blogs-grid {
            grid-template-columns: 1fr;
            max-width: 600px;
          }
        }

        @media (max-width: 600px) {
          .latest-blogs {
            padding: 65px 20px;
          }

          .latest-blogs-header h2 {
            font-size: 40px;
          }

          .latest-blogs-header p {
            font-size: 17px;
          }

          .blog-card {
            padding: 20px;
          }

          .blog-image {
            height: 200px;
          }
        }
      `}</style>
    </section>
  );
}
