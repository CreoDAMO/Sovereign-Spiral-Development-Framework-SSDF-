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
      source: "/",
      destination: "/frontend/index.html"
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
    }
  ]
};
