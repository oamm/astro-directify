import {ChainDefinition} from "./chainTypes";
import {ServerDirectiveHandler} from "../core/types";
import {extractExpression} from "../core/extractExpression";

export function makeDirectiveHandlerForChain(
    chain: ChainDefinition,
    directiveName: string
): ServerDirectiveHandler {
    const directiveConfig = chain.directives[directiveName];

    return ({tag, attr, removeAttribute}) => {
        removeAttribute();

        // Mark directive kind for the chain rewriter
        (tag as any).__directify_kind = directiveName;

        if (directiveConfig?.needsExpression) {
            const extractor = directiveConfig.extractExpression ?? extractExpression;
            (tag as any).__directify_expr = extractor(attr);
        }
    };
}
