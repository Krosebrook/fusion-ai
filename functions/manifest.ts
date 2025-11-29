Deno.serve(async (req) => {
  const manifest = {
    id: "flashfusion-pwa",
    name: "FlashFusion",
    short_name: "FlashFusion",
    description: "Transform ideas into reality with AI-powered CI/CD automation, multi-agent orchestration, and developer tools",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    background_color: "#0F172A",
    theme_color: "#FF7B00",
    orientation: "any",
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=0f172a&size=48",
        sizes: "48x48",
        type: "image/svg+xml"
      },
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=0f172a&size=72",
        sizes: "72x72",
        type: "image/svg+xml"
      },
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=0f172a&size=96",
        sizes: "96x96",
        type: "image/svg+xml"
      },
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=0f172a&size=128",
        sizes: "128x128",
        type: "image/svg+xml"
      },
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=0f172a&size=192",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=ff7b00&size=192",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable"
      },
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=0f172a&size=512",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "https://api.dicebear.com/7.x/shapes/svg?seed=flashfusion&backgroundColor=ff7b00&size=512",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ],
    categories: ["developer", "productivity", "utilities", "business"],
    iarc_rating_id: "",
    screenshots: [
      {
        src: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1280&h=720&fit=crop",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
        label: "FlashFusion Dashboard - CI/CD at a glance"
      },
      {
        src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=390&h=844&fit=crop",
        sizes: "390x844",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "FlashFusion Mobile - Pipelines on the go"
      }
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dash",
        url: "/Dashboard?source=shortcut",
        description: "View your CI/CD dashboard",
        icons: [{ src: "https://api.dicebear.com/7.x/shapes/svg?seed=dashboard&backgroundColor=00b4d8&size=96", sizes: "96x96" }]
      },
      {
        name: "CI/CD Pipelines",
        short_name: "CI/CD",
        url: "/CICDAutomation?source=shortcut",
        description: "Manage deployment pipelines",
        icons: [{ src: "https://api.dicebear.com/7.x/shapes/svg?seed=pipeline&backgroundColor=10b981&size=96", sizes: "96x96" }]
      },
      {
        name: "Agent Orchestrator",
        short_name: "Agents",
        url: "/AgentOrchestrator?source=shortcut",
        description: "Multi-agent automation workflows",
        icons: [{ src: "https://api.dicebear.com/7.x/shapes/svg?seed=agents&backgroundColor=8b5cf6&size=96", sizes: "96x96" }]
      },
      {
        name: "Analytics",
        short_name: "Stats",
        url: "/AdvancedAnalytics?source=shortcut",
        description: "Pipeline performance insights",
        icons: [{ src: "https://api.dicebear.com/7.x/shapes/svg?seed=analytics&backgroundColor=f59e0b&size=96", sizes: "96x96" }]
      }
    ],
    protocol_handlers: [
      {
        protocol: "web+flashfusion",
        url: "/?action=%s"
      }
    ],
    share_target: {
      action: "/share",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "files",
            accept: ["application/json", "text/yaml", ".yml", ".yaml", ".json"]
          }
        ]
      }
    },
    handle_links: "preferred",
    launch_handler: {
      client_mode: ["navigate-existing", "auto"]
    },
    edge_side_panel: {
      preferred_width: 480
    }
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*"
    }
  });
});