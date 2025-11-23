import {describe, test, expect} from "vitest";
import {transformDirectifyDirectives} from "../src/core/transformDirectifyDirectives";
import {directiveIf} from "../dist/directives";


function clean(html: string) {
    return html.replace(/\s+/g, " ").trim();
}

describe("directiveIf – nested + multiple-level combinations", () => {

    // -------------------------------------------------------------------------
    // 1. SIMPLE TRANSFORMATION
    // -------------------------------------------------------------------------
    test("transforms d:if into an Astro expression wrapper", async () => {
        const input = `<div d:if={user.isAdmin}>Hello Admin</div>`;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`<>{(user.isAdmin) && <div>Hello Admin</div>}</>`);
    });

    test("removes the d:if attribute", async () => {
        const input = `<span d:if={flag}>X</span>`;

        const output = await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        });

        expect(output).not.toContain("d:if");
    });

    test("does not modify files with no directives", async () => {
        const input = `<p>No directives here</p>`;

        const output = await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        });

        expect(output).toBe(input);
    });

    // -------------------------------------------------------------------------
    // 2. NESTED DIRECTIVES (DEEP)
    // -------------------------------------------------------------------------
    test("nested d:if inside d:if", async () => {
        const input = `
            <div d:if={outer}>
                <p d:if={inner}>Deep</p>
            </div>
        `;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`<>{(outer) && <div> <>{(inner) && <p>Deep</p>}</> </div>}</>`);
        expect(output).not.toContain("d:if");
    });

    // -------------------------------------------------------------------------
    // 3. SIBLING COMBINATIONS
    // -------------------------------------------------------------------------
    test("sibling tags each with their own d:if", async () => {
        const input = `
            <div>
                <p d:if={a}>A</p>
                <p d:if={b}>B</p>
            </div>
        `;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`<>{(a) && <p>A</p>}</>`);
        expect(output).toContain(`<>{(b) && <p>B</p>}</>`);
        expect(output).not.toContain("d:if");
    });

    // -------------------------------------------------------------------------
    // 4. MIXED ATTRIBUTES & MULTIPLE DIRECTIVES IN SAME LEVEL
    // -------------------------------------------------------------------------
    test("mixed literal & expression syntax", async () => {
        const input = `
            <div d:if="user.isAdmin">
               <p d:if={flag}>Hello</p>
               <span>World</span>
            </div>
        `;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`(user.isAdmin) && <div> <>{(flag) && <p>Hello</p>}</> <span>World</span> </div>`);
    });

    // -------------------------------------------------------------------------
    // 5. DIRECTIVE INSIDE EXPRESSION
    // -------------------------------------------------------------------------
    test("directive inside expression block", async () => {
        const input = `
            {someCheck && (
                <section>
                    <article d:if={articleCheck}>Text</article>
                </section>
            )}
        `;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`<>{(articleCheck) && <article>Text</article>}</>`);
    });

    // -------------------------------------------------------------------------
    // 6. MULTIPLE NESTED LEVELS WITH DIFFERENT FORMATS
    // -------------------------------------------------------------------------
    test("3-level deep nested directives", async () => {
        const input = `
            <div d:if={lvl1}>
                <section d:if={lvl2}>
                    <p d:if={lvl3}>X</p>
                </section>
            </div>
        `;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`(lvl1) && <div> <>{(lvl2) && <section> <>{(lvl3) && <p>X</p>}</> </section>}</> </div>`);
        expect(output).not.toContain("d:if");
    });

    // -------------------------------------------------------------------------
    // 7. NESTED DIRECTIVE + NO DIRECTIVE SIBLINGS
    // -------------------------------------------------------------------------
    test("directive with siblings", async () => {
        const input = `
            <ul>
                <li>1</li>
                <li d:if={cond}>2</li>
                <li>3</li>
            </ul>
        `;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`(cond) && <li>2</li>`);
        expect(output).not.toContain("d:if");
    });

    // -------------------------------------------------------------------------
    // 8. INVALID OR EMPTY DIRECTIVES
    // -------------------------------------------------------------------------
    test("empty d:if should evaluate to false", async () => {
        const input = `<div d:if>Oops</div>`;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`(false) && <div>Oops</div>`);
    });

    test("d:if={} should evaluate to false", async () => {
        const input = `<div d:if={}>Oops</div>`;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`(false) && <div>Oops</div>`);
    });

    test("d:if={undefined}", async () => {
        const input = `<div d:if={undefined}>Oops</div>`;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {if: directiveIf}
        }));

        expect(output).toContain(`(false) && <div>Oops</div>`);
    });

});
