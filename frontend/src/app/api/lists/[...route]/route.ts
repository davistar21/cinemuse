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

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const res = await fetch(finalUrl, {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // If response is 204 No Content, return empty json
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json().catch(() => ({})); // Handle empty or non-json responses safely
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { route: string[] } },
) {
  const route = params.route.join("/");
  return proxyRequest(request, `/lists/${route}`); // Maps /api/lists/xyz -> /api/v1/lists/xyz
}

export async function POST(
  request: NextRequest,
  { params }: { params: { route: string[] } },
) {
  const route = params.route.join("/");
  return proxyRequest(request, `/lists/${route}`);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { route: string[] } },
) {
  const route = params.route.join("/");
  return proxyRequest(request, `/lists/${route}`);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { route: string[] } },
) {
  const route = params.route.join("/");
  return proxyRequest(request, `/lists/${route}`);
}
