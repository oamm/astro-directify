import {describe, test, expect} from "vitest";
import {transformDirectifyDirectives} from "../src/core/transformDirectifyDirectives";
import {directiveFor} from "../src/directives/directiveFor";

/** Utility to normalize output spacing */
function clean(str: string) {
    return str.replace(/\s+/g, " ").trim();
}

describe("directiveFor", () => {

    test("transforms simple d:for loop", async () => {
        const input = `<li d:for="user in users">{user.name}</li>`;

        const output = clean(await transformDirectifyDirectives(input, {
            directives: {for: directiveFor}
        }));

        expect(output).toContain(
            `{users.map((user) => (<li>{user.name}</li>))}`
        );
    });

    test("supports tuple syntax (item, i) in items", async () => {
        const input = `<div d:for="(item, i) in products">{i} - {item.name}</div>`;

        const out = clean(await transformDirectifyDirectives(input, {
            directives: {for: directiveFor}
        }));

        expect(out).toContain(
            `{products.map((item, i) => (<div>{i} - {item.name}</div>))}`
        );
    });

    test("removes the d:for attribute", async () => {
        const input = `<span d:for="x in list">X</span>`;

        const out = await transformDirectifyDirectives(input, {
            directives: {for: directiveFor}
        });

        expect(out).not.toContain("d:for");
    });

    test("handles extra whitespace around 'in'", async () => {
        const input = `<p d:for="   user    in   users   ">{user}</p>`;

        const out = clean(await transformDirectifyDirectives(input, {
            directives: {for: directiveFor}
        }));

        expect(out).toContain(
            `{users.map((user) => (<p>{user}</p>))}`
        );
    });

    test("supports complex iterable expressions", async () => {
        const input = `<li d:for="item in getItems().filter(x => x.active)">{item}</li>`;

        const out = clean(await transformDirectifyDirectives(input, {
            directives: {for: directiveFor}
        }));

        expect(out).toContain(
            `{getItems().filter(x => x.active).map((item) => (<li>{item}</li>))}`
        );
    });

    test("does not modify markup without d:for", async () => {
        const input = `<div>No loops here</div>`;

        const out = await transformDirectifyDirectives(input, {
            directives: {for: directiveFor}
        });

        expect(out).toBe(input);
    });

    test("nested d:for should both transform independently", async () => {
        const input = `
            <ul>
                <li d:for="item in items">
                    <span d:for="sub in item.children">{sub}</span>
                </li>
            </ul>
        `;

        const out = clean(await transformDirectifyDirectives(input, {
            directives: {for: directiveFor}
        }));

        expect(out).toContain(`{items.map((item) => (<li>`);
        expect(out).toContain(
            `{item.children.map((sub) => (<span>{sub}</span>))}`
        );
    });

    test("handles `{i + 1} {item.title}` inside d:for", async () => {
        const input = `
            <ul>
                <li d:for="(item, i) in items">
                    {i + 1} {item.title}
                </li>
            </ul>
        `;

        const out = clean(await transformDirectifyDirectives(input, {
            directives: {for: directiveFor}
        }));

        // Should produce a .map() call for the loop
        expect(out).toContain(`items.map((item, i) =>`);

        // Should preserve both expressions correctly
        expect(out).toContain(`{i + 1}`);
        expect(out).toContain(`{item.title}`);

        // Should wrap the li node inside the map callback
        expect(out).toContain(`(<li>`);

        // No stray null nodes or empty fragments
        expect(out).not.toContain("null</");
        expect(out).not.toContain("<></>");

        // No raw directive left
        expect(out).not.toContain("d:for");
    });

});
