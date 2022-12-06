const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  unstable_flexsearch: {
    codeblocks: true,
  },
  unstable_staticImage: true,
  unstable_defaultShowCopyCode: true,
});

module.exports = withNextra({
  i18n: {
    locales: ["en-US"],
    defaultLocale: "en-US",
  },
  redirects: () => {
    return [
      // {
      //   source: "/docs.([a-zA-Z-]+)",
      //   destination: "/docs/getting-started",
      //   statusCode: 301,
      // },
      // {
      //   source: "/advanced/performance",
      //   destination: "/docs/advanced/performance",
      //   statusCode: 301,
      // },
      // {
      //   source: "/advanced/cache",
      //   destination: "/docs/advanced/cache",
      //   statusCode: 301,
      // },
      // {
      //   source: "/docs/cache",
      //   destination: "/docs/advanced/cache",
      //   statusCode: 301,
      // },
      {
        source: "/change-log",
        destination: "/docs/change-log",
        statusCode: 301,
      },
      {
        source: "/docs.([a-zA-Z-]+)",
        destination: "/docs/getting-started",
        statusCode: 302,
      },
      {
        source: "/docs",
        destination: "/docs/getting-started",
        statusCode: 302,
      },
      {
        source: "/examples",
        destination: "/examples/basic",
        statusCode: 302,
      },
    ];
  },
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  output: "standalone",
});
