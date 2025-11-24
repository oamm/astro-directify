import {getChainByStartKind} from "./chainRegistry";

export function rewriteChainsInline(ast: any) {

    function visit(node: any, parent: any) {
        if (!node || typeof node !== "object") return;

        const children = node.children;
        if (!Array.isArray(children)) return;

        for (let i = 0; i < children.length; i++) {

            const child = children[i];
            if (!child || typeof child !== "object") continue;

            const kind = (child as any).__directify_kind;
            const chainDef = kind && getChainByStartKind(kind);

            if (chainDef) {
                const chainNodes: any[] = [child];
                let j = i + 1;
                while (j < children.length) {
                    const next = children[j];
                    if (!next) break;
                    if (
                        next.type === "text" &&
                        typeof next.value === "string" &&
                        /^\s*$/.test(next.value)
                    ) {
                        j++;
                        continue;
                    }
                    const nk = (next as any).__directify_kind;
                    if (nk && chainDef.continuesWith.includes(nk)) {
                        chainNodes.push(next);
                        j++;
                        continue;
                    }
                    break;
                }
                let endIndex = j;
                while (
                    endIndex < children.length &&
                    children[endIndex].type === "text" &&
                    typeof children[endIndex].value === "string" &&
                    /^\s*$/.test(children[endIndex].value)
                    ) {
                    endIndex++;
                }
                const fragment = chainDef.rewrite(chainNodes);
                children.splice(i, endIndex - i, fragment);
                continue;
            }
            visit(child, node);
        }
    }
    visit(ast, null);
}
