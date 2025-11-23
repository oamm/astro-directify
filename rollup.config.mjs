// rollup.config.mjs
import dts from "rollup-plugin-dts";
import { copyFileSync } from "node:fs";

export default [
    // 1. Type bundle
    {
        input: "dist/index.d.ts",
        output: {
            file: "dist/index.d.ts",
            format: "es"
        },
        plugins: [
            dts(),
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
    }
];
