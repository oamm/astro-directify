import {ChainDefinition} from "../chain/chainTypes";
import {rewriteSwitchChain} from "../chain/rewriteSwitchChain";

export const SWITCH_CHAIN: ChainDefinition = {
    name: "switch-chain",

    directives: {
        switch:  { needsExpression: true },
        case:    { needsExpression: true },
        default: { needsExpression: false }
    },

    startsWith: "switch",
    continuesWith: ["case", "default"],

    rewrite: rewriteSwitchChain
};
