import { NextRequest, NextResponse } from "next/server";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          errors: [
            {
              message: "WordPress returned an invalid response.",
            },
          ],
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("WordPress GraphQL Proxy Error:", error);

    return NextResponse.json(
      {
        errors: [
          {
            message: "Unable to connect to WordPress GraphQL.",
          },
        ],
      },
      { status: 500 }
    );
  }
}