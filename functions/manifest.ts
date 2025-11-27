Deno.serve(async (req) => {
  const manifest = {
    name: "FlashFusion",
    short_name: "FlashFusion",
    description: "Transform ideas into reality with AI-powered development tools",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#0F172A",
    orientation: "portrait-primary",
    icons: [
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=ff7b00",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=ff7b00",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    categories: ["developer tools", "productivity", "utilities"],
    screenshots: [],
    shortcuts: [
      {
        name: "Dashboard",
        url: "/Dashboard",
        description: "Go to Dashboard"
      },
      {
        name: "CI/CD",
        url: "/CICDAutomation",
        description: "CI/CD Automation"
      }
    ]
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400"
    }
  });
});