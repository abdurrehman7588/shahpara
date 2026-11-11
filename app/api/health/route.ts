import { NextResponse } from "next/server";
import { catalogStatus } from "@/lib/woo";

/** Shows whether the site is reading WordPress live (no secrets are included). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await catalogStatus(), { headers: { "Cache-Control": "no-store" } });
}
