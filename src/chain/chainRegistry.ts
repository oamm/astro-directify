import type {ChainDefinition, ChainDirectiveHandlers} from "./chainTypes";
import {makeDirectiveHandlerForChain} from "./makeDirectiveHandler";
import {extractExpression} from "../core/extractExpression";

const chains: ChainDefinition[] = [];
const directiveToChain = new Map<string, ChainDefinition>();
const startKindToChain = new Map<string, ChainDefinition>();

export function registerChain(def: ChainDefinition) {
    chains.push(def);

    startKindToChain.set(def.startsWith, def);

    for (const name of Object.keys(def.directives)) {
        directiveToChain.set(name, def);
    }
}

export function getChainByStartKind(kind: string): ChainDefinition | undefined {
    return startKindToChain.get(kind);
}

export function getChainDirectiveHandlers(): ChainDirectiveHandlers {
    const handlers: ChainDirectiveHandlers = {};

    for (const chain of chains) {
        for (const directiveName of Object.keys(chain.directives)) {
            handlers[directiveName] = makeDirectiveHandlerForChain(chain, directiveName);
        }
    }
    return handlers;
}

export function mergeDirectiveHandlers(user: Record<string, any> = {}) {
    const out = {...user};

    for (const chain of chains) {
        for (const [name, def] of Object.entries(chain.directives)) {
            if (!out[name]) {
                out[name] = buildDirectiveHandlerFromChain(name, def);
            }
        }
    }

    return out;
}

function buildDirectiveHandlerFromChain(name: string, def: any) {
    return ({tag, attr, removeAttribute}: any) => {
        removeAttribute();

        // Mark the directive kind in the AST node
        tag.__directify_kind = name;

        if (def.needsExpression) {
            tag.__directify_expr = extractExpression(attr);
        }

        if (name === "switch") {
            for (const child of tag.children || []) {
                if (!child || !child.attributes) continue;

                for (const a of child.attributes) {
                    if (a.name === "d:case") {
                        child.__directify_kind = "case";
                        child.__directify_expr = extractExpression(a);
                    }

                    if (a.name === "d:default") {
                        child.__directify_kind = "default";
                    }
                }
            }
        }
    };
}