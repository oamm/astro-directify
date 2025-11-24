import {parse} from "@astrojs/compiler";
import {is, serialize} from "@astrojs/compiler/utils";
import {directifyServerDirectivesConfig} from "./types";
import {rewriteChainsInline} from "../chain/rewriteChainsInline";

const cache = new Map<string, { src: string; out: string }>();

export async function transformDirectifyDirectives(
    code: string,
    config: directifyServerDirectivesConfig = {},
    cacheKey?: string
): Promise<string> {

    // Fast path: no directives
    if (!code.includes("d:")) {
        return code;
    }

    // Cached result
    if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached && cached.src === code) return cached.out;
    }

    const directives = config.directives ?? {};
    const parsed = await parse(code);
    const ast = parsed.ast;

    const tasks: Array<() => void> = [];

    function visit(node: any, parent: any, index: number = -1) {
        if (!node || typeof node !== "object") return;

        // Tag-level directives
        if (is.tag(node) && Array.isArray(node.attributes)) {
            const attrs = node.attributes;

            for (const attr of attrs) {
                if (!attr?.name || typeof attr.name !== "string") continue;
                if (!attr.name.startsWith("d:")) continue;

                const directiveName = attr.name.slice(2);
                const handler = directives[directiveName];

                const removeAttribute = () => {
                    const idx = attrs.indexOf(attr);
                    if (idx !== -1) attrs.splice(idx, 1);
                };

                if (handler) {
                    tasks.push(() =>
                        handler({
                            tag: node,
                            attr,
                            removeAttribute,
                            ast,
                            parent,
                            index
                        })
                    );
                } else {
                    tasks.push(() => removeAttribute());
                }
            }
        }

        const children = node.children;
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                visit(children[i], node, i);
            }
        }
    }

    visit(ast, null);

    if (tasks.length === 0)
        return code;

    for (const apply of tasks) {
        apply();
    }

    rewriteChainsInline(ast);

    const result = serialize(ast);

    if (cacheKey) {
        cache.set(cacheKey, {src: code, out: result});
    }

    return result;
}
