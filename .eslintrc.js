module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-lostdock`
  extends: ["lostdock"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
