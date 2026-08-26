"use client";

import { useEffect, useState } from "react";

type Service = {
  id: string;
  databaseId: number;
  title: string;
  content: string;
  icon: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};



/* =========================================================
   FALLBACK SERVICE ICONS
   Used only when no Featured Image exists in WordPress.
   ========================================================= */

function ServiceIcon({ type }: { type: string }) {
  const common =
    "h-[24px] w-[24px] text-[var(--accent)] transition-colors duration-300 group-hover:text-white";

  if (type === "cloud") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path
          d="M7.5 18h9a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 5.4 10.2 4 4 0 0 0 7.5 18Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "code") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path
          d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "database") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <ellipse cx="12" cy="5" rx="7" ry="3" />

        <path
          d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5"
        />

        <path
          d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"
        />
      </svg>
    );
  }

  if (type === "ai") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <rect
          x="6"
          y="6"
          width="12"
          height="12"
          rx="2"
        />

        <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />

        <path d="M10 10h4v4h-4z" />
      </svg>
    );
  }

  if (type === "integration") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <circle cx="7" cy="15" r="2.5" />

        <circle cx="17" cy="9" r="2.5" />

        <path
          d="M9.2 13.7 14.8 10.3"
          strokeLinecap="round"
        />

        <path
          d="M7 12V7"
          strokeLinecap="round"
        />

        <path
          d="M17 12v5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={common}
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path
        d="M8 12h8M12 8v8"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* =========================================================
   SERVICES SECTION
   ========================================================= */

export default function ServicesSection() {
  const [services, setServices] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD SERVICES FROM WORDPRESS
     ======================================================= */

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
  "/api/wordpress",
  {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              query: `
                query GetServices {

                  services(
                    first: 20
                    where: {
                      orderby: {
                        field: DATE
                        order: ASC
                      }
                    }
                  ) {

                    nodes {

                      id
                      databaseId
                      title
                      content
                      icon

                      featuredImage {
                        node {
                          sourceUrl
                          altText
                        }
                      }

                    }

                  }

                }
              `,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `WordPress request failed: ${response.status}`
          );
        }

        const result =
          await response.json();

        console.log(
          "SERVICES DATA:",
          result
        );

        if (result.errors) {
          console.error(
            "Services GraphQL Error:",
            result.errors
          );

          throw new Error(
            "Could not load Services."
          );
        }

        const nodes =
          result?.data?.services?.nodes ?? [];

        setServices(nodes);

      } catch (err) {
        console.error(
          "Failed to load Services:",
          err
        );

        setError(
          "Unable to load Services."
        );

      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);


  return (
    <section
      id="services"
      className="
        relative
        bg-[var(--background)]
        py-[72px]
        transition-colors
        duration-500
        md:py-[86px]
      "
    >

      <div
        className="
          mx-auto
          max-w-[1060px]
          px-6
        "
      >

        {/* =================================================
            EYEBROW
            ================================================= */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-center
            gap-3
          "
        >

          <span
            className="
              h-px
              w-12
              bg-[var(--accent)]/40
            "
          />

          <span
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.1em]
              text-[var(--muted)]
            "
          >
            What We Do
          </span>

          <span
            className="
              h-px
              w-12
              bg-[var(--accent)]/40
            "
          />

        </div>


        {/* =================================================
            HEADING
            ================================================= */}

        <div
          className="
            mx-auto
            max-w-[780px]
            text-center
          "
        >

          <h2
            className="
              text-[36px]
              font-medium
              leading-[1.08]
              tracking-[-0.045em]
              text-[var(--foreground)]
              sm:text-[42px]
              md:text-[46px]
            "
          >
            Engineering the systems that run

            <span
              className="
                block
                bg-gradient-to-r
                from-[#5269ff]
                via-[#7168ff]
                to-[#9b87ff]
                bg-clip-text
                text-transparent
              "
            >
              modern enterprises.
            </span>

          </h2>


          <p
            className="
              mx-auto
              mt-5
              max-w-[610px]
              text-[13px]
              leading-[1.6]
              text-[var(--muted)]
              md:text-[14px]
            "
          >
            We combine Salesforce depth with product-grade engineering, so
            transformation lands as working software not slideware.
          </p>

        </div>


        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (

          <div
            className="
              flex
              min-h-[300px]
              items-center
              justify-center
            "
          >

            <p
              className="
                text-sm
                text-[var(--muted)]
              "
            >
              Loading services...
            </p>

          </div>

        )}


        {/* =================================================
            ERROR
            ================================================= */}

        {!loading && error && (

          <div
            className="
              flex
              min-h-[300px]
              items-center
              justify-center
            "
          >

            <p
              className="
                text-sm
                text-red-400
              "
            >
              {error}
            </p>

          </div>

        )}


        {/* =================================================
            EMPTY
            ================================================= */}

        {!loading &&
          !error &&
          services.length === 0 && (

            <div
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
              "
            >

              <p
                className="
                  text-sm
                  text-[var(--muted)]
                "
              >
                No services have been published in WordPress.
              </p>

            </div>

          )}


        {/* =================================================
            SERVICES
            ================================================= */}

        {!loading &&
          !error &&
          services.length > 0 && (

            <div
              className="
                mt-9
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >

              {services.map((service) => (

                <article
                  key={service.id}
                  className="
                    group
                    min-h-[166px]
                    rounded-[18px]
                    border
                    border-[var(--border)]
                    bg-[var(--surface)]
                    px-[22px]
                    py-[22px]

                    transition-all
                    duration-500
                    ease-out

                    hover:-translate-y-[2px]

                    hover:border-[var(--accent)]/40

                    hover:bg-gradient-to-br
                    hover:from-[#11143a]
                    hover:via-[#24206f]
                    hover:to-[#5038e8]

                    hover:shadow-[0_20px_60px_rgba(80,56,232,0.20)]
                  "
                >

                  {/* =================================================
                      FEATURED IMAGE / ICON
                      ================================================= */}

                  <div
                    className="
                      mb-[18px]
                      flex
                      h-[28px]
                      w-[28px]
                      items-center
                      justify-start
                      transition-all
                      duration-300
                      group-hover:scale-105
                    "
                  >

                    {service.featuredImage?.node?.sourceUrl ? (

                      <img
                        src={
                          service.featuredImage.node.sourceUrl
                        }
                        alt={
                          service.featuredImage.node.altText ||
                          service.title
                        }
                        className="
                          h-[28px]
                          w-[28px]
                          object-contain
                        "
                      />

                    ) : (

                      <ServiceIcon
                        type={service.icon}
                      />

                    )}

                  </div>


                  {/* =================================================
                      TITLE
                      ================================================= */}

                  <h3
                    className="
                      text-[14px]
                      font-semibold
                      tracking-[-0.02em]
                      text-[var(--foreground)]
                      transition-colors
                      duration-300
                      group-hover:text-white
                    "
                  >
                    {service.title}
                  </h3>


                  {/* =================================================
                      DESCRIPTION
                      ================================================= */}

                  <div
                    className="
                      mt-[7px]
                      max-w-[285px]
                      text-[11px]
                      leading-[1.5]
                      text-[var(--muted)]
                      transition-colors
                      duration-300
                      group-hover:text-white/70
                    "
                    dangerouslySetInnerHTML={{
                      __html: service.content,
                    }}
                  />

                </article>

              ))}

            </div>

          )}


        {/* =================================================
            CTA
            ================================================= */}

        <div
          className="
            mt-7
            flex
            justify-center
          "
        >

          <a
            href="/contact"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface)]
              px-5
              py-[9px]
              text-[10px]
              font-medium
              text-[var(--foreground)]
              shadow-sm
              transition-all
              duration-300
              hover:border-[var(--accent)]/40
              hover:bg-[var(--accent)]/[0.06]
            "
          >

            Discuss your roadmap

            <span className="text-[12px]">
              ↗
            </span>

          </a>

        </div>

      </div>

    </section>
  );
}