import {describe, test, expect, beforeAll} from "vitest";
import {transformDirectifyDirectives} from "../src/core/transformDirectifyDirectives";
import {SWITCH_CHAIN} from "../src/handlers/switchChain";
import {mergeDirectiveHandlers, registerChain} from "../src/chain/chainRegistry";

/** Utility: normalize whitespace */
function clean(str: string) {
    return str.replace(/\s+/g, " ").trim();
}

let directives: any;

beforeAll(() => {
    registerChain(SWITCH_CHAIN);
    directives = mergeDirectiveHandlers({});
});

describe("SWITCH / CASE / DEFAULT chain", () => {

    test("basic switch + single case + default", async () => {
        const input = `
            <div d:switch={role}>
                <div d:case="'admin'">A</div>
                <div d:default>None</div>
            </div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(
            `{(role === 'admin') ? <div>A</div> : <div>None</div>}`
        );
    });


    test("switch with multiple cases and default", async () => {
        const input = `
            <div d:switch={x}>
                <div d:case={1}>One</div>
                <div d:case={2}>Two</div>
                <div d:default>Other</div>
            </div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(
            `{(x === 1) ? <div>One</div> : (x === 2) ? <div>Two</div> : <div>Other</div>}`
        );
    });


    test("switch without default falls back to null", async () => {
        const input = `
            <div d:switch={n}>
                <div d:case={10}>Ten</div>
                <div d:case={20}>Twenty</div>
            </div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(
            `{(n === 10) ? <div>Ten</div> : (n === 20) ? <div>Twenty</div> : null}`
        );
    });


    test("switch ignores whitespace-only text nodes between children", async () => {
        const input = `
            <div d:switch={x}>

                <div d:case={1}>One</div>
                
                <div d:default>Oops</div>

            </div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(
            `{(x === 1) ? <div>One</div> : <div>Oops</div>}`
        );
    });


    test("standalone d:case logs warning and is ignored", async () => {
        const input = `<div d:case={5}>Invalid</div>`;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).not.toContain("d:case");
        expect(out).toContain(`<div>Invalid</div>`);
    });


    test("standalone d:default is ignored cleanly", async () => {
        const input = `<p d:default>Alone</p>`;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).not.toContain("d:default");
        expect(out).toContain(`<p>Alone</p>`);
    });


    test("nested switch inside parent element", async () => {
        const input = `
            <section>
                <div d:switch={role}>
                    <div d:case="'admin'">A</div>
                    <div d:default>None</div>
                </div>
            </section>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(
            `{(role === 'admin') ? <div>A</div> : <div>None</div>}`
        );
    });


    test("chains should not escape their parent container", async () => {
        const input = `
            <section>
                <div d:switch={x}>
                    <div d:case={1}>One</div>
                </div>
            </section>

            <div d:default>Invalid</div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain("<div>Invalid</div>");
        expect(out).not.toContain("null null"); // no malformed chain
    });

});
