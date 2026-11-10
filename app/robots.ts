import type { MetadataRoute } from "next";
import { allowIndexing, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/wishlist"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
