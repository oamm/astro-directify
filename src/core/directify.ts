import type {AstroIntegration} from "astro";
import {ServerDirectiveHandler} from "./types";
import {directifyLoader} from "./directifyLoader";


/**
 * Options for configuring the Directify integration.
 *
 * @typedef {Object} directifyOptions
 * @property {Record<string, ServerDirectiveHandler>} [directives]
 *   A map of directive handlers indexed by directive name.
 *   Each key corresponds to a directive prefix (e.g., `"if"` for `d:if`),
 *   and the value is a custom transformer that modifies the AST node.
 *
 *   By default, Directify includes built-in directives (like `d:if`),
 *   but this option allows you to extend or override them.
 */
export interface directifyOptions {
    directives?: Record<string, ServerDirectiveHandler>;
}

/**
 * Astro Directify Integration
 *
 * Registers the Directify AST transformation pipeline into Astro’s build system.
 * This enables the use of declarative template-level control directives such as:
 *
 * ```astro
 * <div d:if={condition}>Visible only when condition is true</div>
 * <li d:for={item in items}>{item.name}</li>
 * <span d:show={isVisible}>...</span>
 * ```
 *
 * Directify executes **before Astro compiles your `.astro` templates**, transforming
 * any directives you registered into valid Astro expression blocks.
 *
 * Example usage in `astro.config.mjs`:
 *
 * ```ts
 * import directify from "astro-directify";
 * import { directiveIf } from "astro-directify/directives";
 *
 * export default {
 *   integrations: [
 *     directify({
 *       directives: {
 *         if: directiveIf,          // custom or overridden directive
 *         show: myShowDirective,     // user-defined directive
 *       }
 *     })
 *   ]
 * }
 * ```
 *
 * @param {directifyOptions} [options={}]
 *   Configuration object for extending or overriding directive behaviors.
 *
 * @returns {AstroIntegration}
 *   A fully registered Astro integration that injects the Directify loader.
 */
export default function directify(options: directifyOptions = {}): AstroIntegration {
    return {
        name: "astro-directify",
        hooks: {
            "astro:config:setup"({updateConfig, logger}) {
                logger.info("[directify] Registering loader (pre-Astro)…");

                updateConfig({
                    vite: {
                        plugins: [
                            directifyLoader(options),
                        ],
                    }
                });
            }
        }
    };
}

