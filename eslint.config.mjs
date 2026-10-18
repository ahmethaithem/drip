import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.ts"],
    rules: {
      // These files are vendored verbatim from shadcn@4.17.0. Keep the
      // registry source intact while applying the stricter rules to Site code.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: [
      "app/cart/page.tsx",
      "app/checkout/page.tsx",
      "app/products/**/page.tsx",
      "components/cart-page-client.tsx",
      "components/checkout-client.tsx",
      "components/product-card.tsx",
      "components/product-detail-client.tsx",
      "components/site-footer.tsx",
      "components/site-header.tsx",
      "components/success-client.tsx",
    ],
    rules: {
      // Vinext beta's client Link router currently throws during RSC prefetch.
      // Native navigation keeps customer routes reliable until that runtime bug is fixed.
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
  {
    files: ["app/layout.tsx"],
    rules: {
      "@next/next/no-page-custom-font": "off",
    },
  },
]);

export default eslintConfig;
