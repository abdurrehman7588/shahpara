/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "shahpara.pk", pathname: "/wp-content/uploads/**" }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // Keep every URL that exists on the live WordPress store working.
  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/ramadan", destination: "/occasions/ramadan", permanent: true },
      { source: "/eid-204", destination: "/occasions/eid", permanent: true },
      { source: "/mothers-day-2", destination: "/occasions/mothers-day", permanent: true },
      { source: "/forhim", destination: "/occasions/for-him", permanent: true },
      { source: "/mere-mahboob", destination: "/occasions/mere-mahboob", permanent: true },
      { source: "/naqsh-e-khass", destination: "/product-category/naqsh-e-khass", permanent: true },
      { source: "/b-w-2", destination: "/product-category/bw", permanent: true },
      { source: "/album", destination: "/product-category/album", permanent: true },
      { source: "/tags", destination: "/product-category/tags", permanent: true },
      { source: "/my-account", destination: "/cart", permanent: false },
    ];
  },
};

export default nextConfig;
