export function extractExpression(attr: any): string {
    const v = attr?.value;

    if (v == null || v == '' || v == "undefined") return "false";

    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        return String(v);
    }
    if (Array.isArray(v)) {
        const exprNode = v.find((part: any) => part?.type === "expression");
        if (exprNode?.value) {
            return exprNode.value;
        }
        const text = v.map((p: any) => p?.value ?? "").join("").trim();
        if (text) return text;
    }
    return "false";
}
