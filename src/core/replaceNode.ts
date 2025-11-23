export function replaceNode(oldNode: any, newNode: any, ast: any, parent?: any, idx?: number) {
    if (parent && Array.isArray(parent.children)) {
        if (idx !== -1) {
            parent.children.splice(idx, 1, newNode);
            return;
        }
    }

    if (Array.isArray(ast.children)) {
        if (idx !== -1) {
            newNode.parent = ast;
            ast.children.splice(idx, 1, newNode);
            return;
        }
    }

    console.warn("[directify] Could not replace node.");
}