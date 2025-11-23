import typescript from "@rollup/plugin-typescript";
import { copyFileSync } from "node:fs";

export default [
    // --------------------------------------------
    // 1) JS output — no declarations here!
    // --------------------------------------------
    {
        input: "src/index.ts",
        output: {
            dir: "dist",
            format: "esm",
            preserveModules: true,
            preserveModulesRoot: "src",
            entryFileNames: "[name].js",  // Force .js extension
        },
        external: [
            "node:fs",
            "@astrojs/compiler",
            "@astrojs/compiler/utils"
        ],
        plugins: [
            typescript({
                tsconfig: "./tsconfig.json",
                declaration: true,        // IMPORTANT
            }),
            {
                name: "copy-directify-directives",
                writeBundle() {
                    copyFileSync(
                        "src/types/directify-directives.d.ts",
                        "dist/directify-directives.d.ts"
                    );
                }
            }
        ]
    },
];
