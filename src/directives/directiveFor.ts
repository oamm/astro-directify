import {ServerDirectiveHandler} from "../core/types";
import {replaceNode} from "../core/replaceNode";

export const directiveFor: ServerDirectiveHandler = ({
                                                         tag,
                                                         attr,
                                                         removeAttribute,
                                                         ast,
                                                         parent,
                                                         index
                                                     }) => {
    removeAttribute();

    const raw =
        typeof attr.value === "string"
            ? attr.value
            : Array.isArray(attr.value)
                ? attr.value.map((p: any) => p?.value ?? "").join("").trim()
                : "";

    const { item, index: indexName, items } = parseFor(raw);
    const params = indexName ? `${item}, ${indexName}` : item;

    // Expression content WITHOUT `{ }`
    const expr = {
        type: "expression",
        children: [
            { type: "text", value: `${items}.map((${params}) => (` },
            tag,
            { type: "text", value: `))` }
        ]
    };

    // Replace the <li d:for> node with a direct expression
    replaceNode(
        tag,
        expr,   // 👈 directly pass the expression, no outer fragment!
        ast,
        parent,
        index
    );
};

function parseFor(raw: string) {
    const cleaned = raw.trim();
    const [lhs, rhs] = cleaned.split(/\s+in\s+/);

    if (!lhs || !rhs) {
        return {item: "item", index: undefined, items: "[]"};
    }

    let item: string | undefined;
    let index: string | undefined;

    if (lhs.startsWith("(") && lhs.endsWith(")")) {
        const parts = lhs
            .slice(1, -1)
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);

        item = parts[0];
        index = parts[1];
    } else {
        item = lhs.trim();
    }

    return {
        item: item ?? "item",
        index,
        items: rhs.trim()
    };
}
