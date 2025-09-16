const fs = require("fs");
const path = require("path");

// Example: URLs to include in sitemap
const pages = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.8 },
  { url: "/contact", changefreq: "monthly", priority: 0.8 },
  // Add more public pages dynamically from database or content folder
];

// Generate XML content
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `<url>
    <loc>https://pascel.vercel.app${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

// Write to public folder
fs.writeFileSync(path.join(__dirname, "public", "sitemap.xml"), sitemap);

console.log("✅ sitemap.xml generated in public folder!");
