import type {AstroIntegration} from "astro";
import {ServerDirectiveHandler} from "./types";
import {directifyLoader} from "./directifyLoader";
import {mergeDirectiveHandlers, registerChain} from "../chain/chainRegistry";
import {IF_CHAIN} from "../handlers/ifChain";
import {SWITCH_CHAIN} from "../handlers/switchChain";
import {directiveFor} from "../directives/directiveFor";

registerChain(IF_CHAIN);
registerChain(SWITCH_CHAIN);

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
export function directifyIntegration(options: directifyOptions = {}): AstroIntegration {
    return {
        name: "astro-directify",
        hooks: {
            "astro:config:setup"({updateConfig, logger}) {
                logger.info("[directify] Registering loader (pre-Astro)…");

                const directiveHandlers = mergeDirectiveHandlers({
                    for: directiveFor,
                    ...(options.directives ?? {})
                });

                updateConfig({
                    vite: {
                        plugins: [
                            directifyLoader({
                                ...options,
                                directives: directiveHandlers
                            }),
                        ],
                    }
                });
            }
        }
    };
}

