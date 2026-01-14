export default {
  version: 2,
  name: "ssdf",

  builds: [
    {
      src: "backend/api/**/*.js",
      use: "@vercel/node"
    },
    {
      src: "frontend/**",
      use: "@vercel/static"
    }
  ],

  rewrites: [
    {
      source: "/api/(.*)",
      destination: "/backend/api/$1"
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
      source: "/",
      destination: "/frontend/index.html"
    },
    {
      source: "/(.*)",
      destination: "/frontend/$1"
    }
  ],

  functions: {
    "backend/api/**/*.js": {
      memory: 1024,
      maxDuration: 10
    }
  },

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
    }
  ],

  env: {
    NODE_ENV: "production"
  }
};
