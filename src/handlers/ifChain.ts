import {ChainDefinition} from "../chain/chainTypes";
import {rewriteIfChain} from "../chain/rewriteIfChain";

export const IF_CHAIN: ChainDefinition = {
    name: "if-chain",
    directives: {
        if:     { needsExpression: true },
        elseif: { needsExpression: true },
        else:   { needsExpression: false }
    },
    startsWith: "if",
    continuesWith: ["elseif", "else"],

    rewrite: rewriteIfChain
};
