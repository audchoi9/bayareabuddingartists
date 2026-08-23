import { NextResponse } from "next/server";

// Verifies the admin password server-side so it never ships to the browser.
// Set ADMIN_PASSWORD in .env.local (and in Vercel for production).
export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Admin password is not configured on the server." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    // ignore malformed body
  }

  if (password && password === expected) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "Incorrect password." },
    { status: 401 },
  );
}
