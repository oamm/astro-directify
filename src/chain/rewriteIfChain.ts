export function rewriteIfChain(chain: any[]) {
    if (!chain.length) {
        return {
            type: "fragment",
            name: "",
            attributes: [],
            children: []
        };
    }

    if (chain.length === 1) {
        const node = chain[0];
        const kind = (node as any).__directify_kind;
        const expr = (node as any).__directify_expr;

        if (kind === "if") {
            const expressionNode = {
                type: "expression",
                children: [
                    {
                        type: "text",
                        value: `(${expr}) && `
                    },
                    node
                ]
            };

            return {
                type: "fragment",
                name: "",
                attributes: [],
                children: [expressionNode]
            };
        }
    }

    const children: any[] = [];
    const lastIndex = chain.length - 1;

    for (let i = 0; i < chain.length; i++) {
        const node = chain[i];
        const kind = (node as any).__directify_kind;
        const expr = (node as any).__directify_expr;

        if (kind === "if" || kind === "elseif") {

            children.push({
                type: "text",
                value: `(${expr}) ? `
            });

            children.push(node);

            if (i === lastIndex) {
                children.push({
                    type: "text",
                    value: " : null"
                });
            } else {
                children.push({
                    type: "text",
                    value: " : "
                });
            }
        } else if (kind === "else") {
            children.push(node);
        }
    }

    const expressionNode = {
        type: "expression",
        children
    };

    return {
        type: "fragment",
        name: "",
        attributes: [],
        children: [expressionNode]
    };
}
