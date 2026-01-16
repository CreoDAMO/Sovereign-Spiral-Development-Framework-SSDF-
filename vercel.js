export default {
  version: 2,
  name: "ssdf",

  functions: {
    "api/**/*.js": {
      memory: 1024,
      maxDuration: 10
    }
  },

  rewrites: [
    {
      source: "/api/(.*)",
      destination: "/api/$1"
    },
    {
      source: "/success",
      destination: "/frontend/success.html"
    },
    {
      source: "/cancel",
      destination: "/frontend/cancel.html"
    },
    {
      source: "/privacy",
      destination: "/frontend/privacy.html"
    },
    {
      source: "/terms",
      destination: "/frontend/terms.html"
    },
    {
      source: "/refund",
      destination: "/frontend/refund.html"
    },
    {
      source: "/",
      destination: "/frontend/index.html"
    },
    {
      source: "/(.*).html",
      destination: "/frontend/$1.html"
    },
    {
      source: "/(.*)",
      destination: "/frontend/$1"
    }
  ],

  headers: [
    {
      source: "/api/(.*)",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*"
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, OPTIONS"
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "Content-Type, stripe-signature"
        }
      ]
    },
    {
      source: "/frontend/(.*).html",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
};
