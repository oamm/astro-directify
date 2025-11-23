export interface ServerDirectiveHandlerArgs {
    tag: any;
    attr: any;
    removeAttribute: () => void;
    ast: any;
    parent?: any;
    index?: number;
}

export type ServerDirectiveHandler = (args: ServerDirectiveHandlerArgs) => void;

export interface directifyServerDirectivesConfig {
    directives?: Record<string, ServerDirectiveHandler>;
}



