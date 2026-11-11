import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Called by a WooCommerce webhook (Product created / updated / deleted) so changes in
 * wp-admin show on the site immediately instead of within a few minutes.
 * WooCommerce signs each call with WC_WEBHOOK_SECRET; unsigned calls are refused.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function signedByWooCommerce(body: string, signature: string | null) {
  const secret = process.env.WC_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(body, "utf8").digest();
  const given = Buffer.from(signature, "base64");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(req: Request) {
  const body = await req.text();

  // When a webhook is saved, WooCommerce first sends an unsigned "ping" to check the URL works.
  if (!req.headers.get("x-wc-webhook-signature") && body.startsWith("webhook_id=")) {
    return NextResponse.json({ ok: true, ping: true });
  }
  if (!signedByWooCommerce(body, req.headers.get("x-wc-webhook-signature"))) {
    return NextResponse.json({ error: "invalid-signature" }, { status: 401 });
  }

  let id: number | undefined;
  try {
    id = Number(JSON.parse(body).id) || undefined;
  } catch {
    /* refresh everything */
  }
  revalidateTag("catalog");
  if (id) revalidateTag(`product-${id}`);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: id ?? "all" });
}
