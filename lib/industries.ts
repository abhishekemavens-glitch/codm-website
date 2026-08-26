import { fetchWordPress } from "./wordpress";

export type Industry = {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

export async function getIndustries(): Promise<Industry[]> {
  const data = await fetchWordPress(`
    query GetIndustries {
      industries(first: 20) {
        nodes {
          id
          databaseId
          title
          slug
          excerpt
          content
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `);

  return data.industries.nodes;
}