const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

export async function fetchWordPress(query: string) {
  const response = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `WordPress GraphQL request failed: ${response.status}`
    );
  }

  const result = await response.json();

  if (result.errors) {
    console.error("WordPress GraphQL errors:", result.errors);
    throw new Error("WordPress GraphQL query failed");
  }

  return result.data;
}