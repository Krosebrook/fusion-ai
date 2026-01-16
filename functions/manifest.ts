/**
 * PWA Manifest Generator
 * 
 * Dynamically generates the Web App Manifest for Progressive Web App functionality.
 * Provides configuration for app installation, icons, theme colors, and display mode.
 * 
 * Features:
 * - Standalone app mode
 * - Multiple icon sizes for various devices
 * - Theme color and background color
 * - Start URL and scope configuration
 * - Shortcuts for quick actions
 * - Share target for receiving shared content
 * 
 * @endpoint /api/manifest
 */
Deno.serve(async (req) => {
  const manifest = {
    name: 'FlashFusion - AI Development Platform',
    short_name: 'FlashFusion',
    description: 'Enterprise-grade AI development platform with prompt engineering, agent orchestration, and CI/CD automation',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    
    // App icons for various device sizes
    icons: [
      {
        src: '/icon-72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    
    // App shortcuts for quick actions from home screen
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Open your dashboard',
        url: '/Dashboard',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      },
      {
        name: 'Marketplace',
        short_name: 'Marketplace',
        description: 'Browse app marketplace',
        url: '/Marketplace',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      },
      {
        name: 'CI/CD',
        short_name: 'CI/CD',
        description: 'Manage CI/CD pipelines',
        url: '/CICDAutomation',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      },
      {
        name: 'Analytics',
        short_name: 'Analytics',
        description: 'View analytics dashboard',
        url: '/Analytics',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      }
    ],
    
    // Share target configuration
    share_target: {
      action: '/share',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [
          {
            name: 'media',
            accept: ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx']
          }
        ]
      }
    },
    
    // Categories for app stores
    categories: ['productivity', 'developer tools', 'utilities'],
    
    // Screenshots for app stores (optional but recommended)
    screenshots: [
      {
        src: '/screenshot-1.png',
        sizes: '1280x720',
        type: 'image/png',
        label: 'Dashboard view'
      },
      {
        src: '/screenshot-2.png',
        sizes: '1280x720',
        type: 'image/png',
        label: 'CI/CD Automation'
      }
    ],
    
    // Related applications
    related_applications: [],
    prefer_related_applications: false,
    
    // Protocol handlers for deep linking
    protocol_handlers: [
      {
        protocol: 'web+flashfusion',
        url: '/?action=%s'
      }
    ]
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
});