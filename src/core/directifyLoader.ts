import type {Plugin} from "vite";
import fs from "node:fs";
import {directifyOptions} from "./directifyIntegration";
import {transformDirectifyDirectives} from "./transformDirectifyDirectives";

const RAW_ASTRO_TEMPLATE_RE =
    /\.astro(\?astro)?([&?]type=template)?$/;

export function directifyLoader(options: directifyOptions = {}): Plugin {
    return {
        name: "directify-loader",
        enforce: "pre",
        async load(id) {
            if (!RAW_ASTRO_TEMPLATE_RE.test(id)) return null;

            const filepath = id.split("?")[0];
            const src = await fs.promises.readFile(filepath, "utf8");

            return await transformDirectifyDirectives(src, options, filepath);
        }
    };
}