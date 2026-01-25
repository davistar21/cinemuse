import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api/v1";

async function proxyRequest(request: NextRequest, endpoint: string) {
  try {
    const body = request.method !== "GET" ? await request.json() : undefined;
    const searchParams = request.nextUrl.searchParams.toString();
    const finalUrl = `${BACKEND_URL}${endpoint}${searchParams ? `?${searchParams}` : ""}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward auth header if present
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(finalUrl, {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Handle all auth routes
export async function POST(
  request: NextRequest,
  { params }: { params: { route: string[] } },
) {
  const route = params.route.join("/");
  return proxyRequest(request, `/auth/${route}`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { route: string[] } },
) {
  const route = params.route.join("/");
  return proxyRequest(request, `/auth/${route}`);
}
