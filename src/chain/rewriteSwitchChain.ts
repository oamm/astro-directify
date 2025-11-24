export function rewriteSwitchChain(chain: any[]) {
    if (!chain.length) {
        return {
            type: "fragment",
            name: "",
            attributes: [],
            children: []
        };
    }

    const switchNode = chain[0];
    const baseExpr = (switchNode as any).__directify_expr;

    const bodyChildren = Array.isArray((switchNode as any).children)
        ? (switchNode as any).children
        : [];

    const branches = bodyChildren
        .filter((n: any) => n && typeof n === "object")
        .filter((n: any) => {
            const k = n.__directify_kind;
            return k === "case" || k === "default";
        })
        .map((n: any) => ({
            kind: n.__directify_kind as "case" | "default",
            expr: n.__directify_expr,
            node: n
        }));

    if (branches.length === 0) {
        return {
            type: "fragment",
            name: "",
            attributes: [],
            children: []
        };
    }

    const children: any[] = [];
    const lastIndex = branches.length - 1;
    const hasDefault = branches.some((b: any) => b.kind === "default");

    for (let i = 0; i < branches.length; i++) {
        const br = branches[i];

        if (br.kind === "case") {
            const isLast = i === lastIndex;
            const nextIsDefault =
                !isLast && branches[i + 1].kind === "default";

            children.push({
                type: "text",
                value: `(${baseExpr} === ${br.expr}) ? `
            });

            children.push(br.node);

            const isLastMeaningful =
                (isLast && !hasDefault) || nextIsDefault;

            if (isLastMeaningful) {
                if (!hasDefault) {

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
            } else {

                children.push({
                    type: "text",
                    value: " : "
                });
            }
        } else if (br.kind === "default") {
            children.push(br.node);
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
