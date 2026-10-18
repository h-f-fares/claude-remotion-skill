import { Config } from "@remotion/cli/config";

// inline .woff2 imports as data URLs (see src/components/Fonts.ts)
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      { test: /\.woff2$/, type: "asset/inline" },
      ...(config.module?.rules ?? []).map((r) =>
        r && typeof r === "object" && r.test instanceof RegExp && r.test.test("x.woff2")
          ? { ...r, exclude: /\.woff2$/ } : r),
    ],
  },
}));
