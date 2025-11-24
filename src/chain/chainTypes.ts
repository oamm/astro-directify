import {ServerDirectiveHandler} from "../core/types";

export interface ChainDirectiveConfig {
    needsExpression?: boolean;
    extractExpression?: (attr: any) => string;
}

export interface ChainDefinition {
    name: string;
    directives: Record<string, ChainDirectiveConfig>;
    startsWith: string;
    continuesWith: string[];
    rewrite(chain: any[]): any;
}

export type ChainDirectiveHandlers = Record<string, ServerDirectiveHandler>;
