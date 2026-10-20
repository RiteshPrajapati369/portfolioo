import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riteshprajapati.com.np";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/*", "/images/*"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/auth/*",
          "/_next/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/blog", "/blog/*", "/images/*"],
        disallow: ["/dashboard/*", "/api/*", "/auth/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
