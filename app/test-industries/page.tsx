import { getIndustries } from "@/lib/industries";

export default async function TestIndustriesPage() {
  const industries = await getIndustries();

  return (
    <main className="min-h-screen bg-white px-8 py-20 text-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-10 text-4xl font-bold">
          WordPress Industries
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {industries.map((industry) => (
            <div
              key={industry.id}
              className="rounded-2xl border border-gray-200 p-6"
            >
              <h2 className="text-2xl font-semibold">
                {industry.title}
              </h2>

              <p className="mt-2 text-gray-500">
                Slug: {industry.slug}
              </p>

              {industry.featuredImage?.node?.sourceUrl && (
                <img
                  src={industry.featuredImage.node.sourceUrl}
                  alt={
                    industry.featuredImage.node.altText ||
                    industry.title
                  }
                  className="mt-5 w-full rounded-xl"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}