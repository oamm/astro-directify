import {ServerDirectiveHandler} from "../core/types";
import {replaceNode} from "../core/replaceNode";
import {extractExpression} from "../core/extractExpression";

export const directiveIf: ServerDirectiveHandler = ({
                                                        tag,
                                                        attr,
                                                        removeAttribute,
                                                        ast,
                                                        parent,
                                                        index
                                                    }) => {
    removeAttribute();
    const expr = extractExpression(attr);
    const expressionNode = {
        type: "expression",
        children: [
            {
                type: "text",
                value: `(${expr}) && `
            },
            tag
        ]
    };

    const wrapperFragment = {
        type: "fragment",
        name: "",
        attributes: [],
        children: [expressionNode]
    };

    replaceNode(tag, wrapperFragment, ast, parent, index);
};
