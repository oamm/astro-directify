import {describe, test, expect, beforeAll} from "vitest";
import {transformDirectifyDirectives} from "../src/core/transformDirectifyDirectives";
import {mergeDirectiveHandlers, registerChain} from "../src/chain/chainRegistry";
import {IF_CHAIN} from "../src/handlers/ifChain";

// Chain system imports

/** Utility: normalize whitespace */
function clean(str: string) {
    return str.replace(/\s+/g, " ").trim();
}

let directives: any;

beforeAll(() => {
    // Register built-in chains
    registerChain(IF_CHAIN);

    // Build directive handlers from chain config
    directives = mergeDirectiveHandlers({});
});

describe("IF / ELSEIF / ELSE chain rewriting", () => {

    test("single d:if without else renders as && expression", async () => {
        const input = `<div d:if={a}>A</div>`;
        const out = clean(await transformDirectifyDirectives(input, {directives}));
        expect(out).toContain(`{(a) && <div>A</div>}`);
        expect(out).not.toContain("null");
    });


    test("basic if + else transformation", async () => {
        const input = `
            <div d:if={a}>A</div>
            <div d:else>B</div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(`{(a) ? <div>A</div> : <div>B</div>}`);
    });

    test("if + elseif + else chain", async () => {
        const input = `
            <div d:if={a}>A</div>
            <div d:elseif={b}>B</div>
            <div d:else>C</div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(
            `{(a) ? <div>A</div> : (b) ? <div>B</div> : <div>C</div>}`
        );
    });

    test("multiple elseif chain", async () => {
        const input = `
            <div d:if={a}>A</div>
            <div d:elseif={b}>B</div>
            <div d:elseif={c}>C</div>
            <div d:else>D</div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(
            `{(a) ? <div>A</div> : (b) ? <div>B</div> : (c) ? <div>C</div> : <div>D</div>}`
        );
    });

    test("attributes removed", async () => {
        const input = `
            <span d:if={x}>X</span>
            <span d:elseif={y}>Y</span>
            <span d:else>Z</span>
        `;

        const out = await transformDirectifyDirectives(input, {directives});

        expect(out).not.toContain("d:if");
        expect(out).not.toContain("d:elseif");
        expect(out).not.toContain("d:else");
    });

    test("standalone d:else is ignored", async () => {
        const input = `<div d:else>Lonely Else</div>`;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).not.toContain("d:else");
        expect(out).toContain(`<div>Lonely Else</div>`);
    });

    test("standalone d:elseif is ignored", async () => {
        const input = `<p d:elseif={z}>Alone</p>`;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).not.toContain("d:elseif");
        expect(out).toContain(`<p>Alone</p>`);
    });

    test("nested if/elseif/else inside parent", async () => {
        const input = `
            <section>
                <div d:if={a}>A</div>
                <div d:elseif={b}>B</div>
                <div d:else>C</div>
            </section>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(
            `{(a) ? <div>A</div> : (b) ? <div>B</div> : <div>C</div>}`
        );
    });

    test("chains do not merge across parents", async () => {
        const input = `
            <section>
                <div d:if={a}>A</div>
            </section>

            <div d:else>Invalid</div>
        `;

        const out = clean(await transformDirectifyDirectives(input, {directives}));

        expect(out).toContain(`<div>Invalid</div>`);
        expect(out).not.toContain("null"); // No malformed chain
    });

});
