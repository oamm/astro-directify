import "astro";

declare module "astro" {
    interface AstroBuiltinAttributes {
        "d:if"?: any;
    }
}