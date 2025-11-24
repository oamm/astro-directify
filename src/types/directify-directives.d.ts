import "astro";

declare module "astro" {
    interface AstroBuiltinAttributes {
        "d:if"?: any;
        "d:elseif"?: any;
        "d:else"?: any;
        "d:switch"?: any;
        "d:case"?: any;
        "d:default"?: any;
        "d:for"?: any;
    }
}