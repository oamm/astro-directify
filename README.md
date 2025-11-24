# 🌌 astro-directify
### Declarative server-side control flow for Astro templates

`astro-directify` brings **clean, expressive control-flow syntax** to Astro, powered entirely by compile-time AST transforms.

Supported directives:

- `d:if`
- `d:elseif`
- `d:else`
- `d:for`
- `d:switch`
- `d:case`
- `d:default`

All directives are **pure syntax sugar**: they compile down to ordinary Astro/JSX expressions and run **once on the server**.

![npm](https://img.shields.io/npm/v/astro-directify)
![license](https://img.shields.io/npm/l/astro-directify)
![downloads](https://img.shields.io/npm/dt/astro-directify)
![feedback-welcome](https://img.shields.io/badge/feedback-welcome-blue)
---

### ✅ Features

- ✔ **SSR-only**
- ✔ **Zero client JavaScript**
- ✔ **Compile-time transforms (no runtime cost)**
- ✔ **Works with React / Vue / Svelte islands**
- ✔ **Produces valid Astro output**

---

## 🚀 Installation

```bash
npm install astro-directify
```

Enable the plugin in your Astro config:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { directifyIntegration } from 'astro-directify';

export default defineConfig({
  integrations: [directifyIntegration()]
});
```

You're now ready to use directives in any `.astro` file.

---
### 📘 TypeScript Setup for astro-directify

#### Enable IntelliSense for `d:*` directives in your Astro project

Astro's TypeScript environment needs to *see* the directive attribute definitions in order to provide IntelliSense and avoid red underline errors such as:

```
Property 'd:if' does not exist on type ... 
```

Follow these steps to make TS recognize all `d:*` directives (`d:if`, `d:elseif`, `d:else`, `d:for`, `d:switch`, `d:case`, `d:default`).


---

#### ✅ 1. Create a Types Folder Inside `src/`

Inside your Astro project, create:

```
src/types/directify-directives.d.ts
```


---

#### ✅ 2. Paste This Declaration File

```ts
import "astro";

declare module "astro" {
  interface AstroBuiltinAttributes {
    "d:if"?: any;
    "d:elseif"?: any;
    "d:else"?: any;
    "d:for"?: any;
    "d:switch"?: any;
    "d:case"?: any;
    "d:default"?: any;
  }
}
```

This tells TypeScript that these attributes are valid on Astro components/elements.

---

#### ✅ 3. Ensure `tsconfig.json` Includes `src/`

Most Astro projects already do this by default.

But if your project has a custom `tsconfig`, make sure it contains:

```json
{
  "include": ["src"]
}
```

This ensures TypeScript loads `src/types/directify-directives.d.ts` correctly.


---

#### 🎉 You're Done!

Once the file is inside `src/types/`, your editor (VSCode, WebStorm, etc.) will automatically:

- Recognize all `d:*` directives
- Provide IntelliSense
- Remove red squiggly errors
- Validate expressions inside `{}`

No need for any additional config or plugin setup.

---
# 🧩 Directives

## 🔹 `d:if`, `d:elseif`, `d:else` — Conditional Rendering

Basic `if`:

```astro
<button d:if={user}>Logout</button>
```

Compiles to:

```astro
{(user) && <button>Logout</button>}
```

Full chain:

```astro
<div d:if={role === 'admin'}>Admin</div>
<div d:elseif={role === 'manager'}>Manager</div>
<div d:else>Guest</div>
```

Compiles roughly to:

```astro
{(role === 'admin') ? (
  <div>Admin</div>
) : (role === 'manager') ? (
  <div>Manager</div>
) : (
  <div>Guest</div>
)}
```

- Chains are **local to their parent**: `d:else` won’t attach to an `d:if` in a different container.
- Standalone `d:else` / `d:elseif` (without a preceding `d:if`) are rendered as normal elements with the directive stripped.

---

## 🔹 `d:for` — Simple Looping

```astro
<li d:for="user in users">
  {user.name}
</li>
```

Compiles to:

```astro
{users.map((user) => (
  <li>{user.name}</li>
))}
```

With index:

```astro
<li d:for="(user, i) in users">
  {i + 1}. {user.name}
</li>
```

Compiles to:

```astro
{users.map((user, i) => (
  <li>{i + 1}. {user.name}</li>
))}
```

- The left side of `in` can be:
    - `item`
    - `(item, index)`
- The right side should be any iterable expression (typically an array).

---

## 🔹 `d:switch`, `d:case`, `d:default` — Switch-style Selection

```astro
<div d:switch={role}>
  <div d:case="'admin'">Admin panel</div>
  <div d:case="'editor'">Editor tools</div>
  <div d:default>Viewer mode</div>
</div>
```

Compiles to a chained ternary:

```astro
{(role === 'admin') ? (
  <div>Admin panel</div>
) : (role === 'editor') ? (
  <div>Editor tools</div>
) : (
  <div>Viewer mode</div>
)}
```

Without `d:default`:

```astro
<div d:switch={status}>
  <div d:case="'loading'">Loading…</div>
  <div d:case="'error'">Something went wrong</div>
</div>
```

Compiles to something like:

```astro
{(status === 'loading') ? (
  <div>Loading…</div>
) : (status === 'error') ? (
  <div>Something went wrong</div> 
) : null}
```

Notes:

- `d:case` expressions are compared with `===` to the `d:switch` expression.
- Only direct children of the switch container are considered for `d:case` / `d:default`.
- Standalone `d:case` / `d:default` (without a `d:switch` parent) are rendered as normal elements, with the directive removed.

---

# 🛡 Why astro-directify?

Astro encourages clean, server-first templates — but logic often becomes noisy:

```astro
{user && <div>Hello</div>}
{items.map(item => <Row item={item} />)}
{condition ? <A /> : <B />}
```

As templates grow, **inline expressions become harder to scan**.

`astro-directify` keeps your templates **declarative and readable** while:

- Adding **no client-side runtime**
- Preserving **plain Astro/JSX output**
- Playing nicely with islands (React / Vue / Svelte)

### Under the hood

- ✔ AST-based (never regex)
- ✔ Pure compile-time transformation
- ✔ Zero client bundle impact
- ✔ Works with React/Vue/Svelte components
- ✔ 100% valid Astro syntax after transform

---

# 🔧 Compatibility

`astro-directify` works with:

- Astro SSR
- React, Vue, Svelte islands
- Tailwind (and other CSS frameworks)
- Static output
- Server-only template logic
- MDX / Markdown (inside JSX regions)

Because all directives compile to **ordinary Astro expressions**, there’s no lock-in.

---

# 🧱 Example Dashboard

```astro
---
const { user, stats, role } = Astro.locals;
const items = await getItems();
---

<section>
  <header d:if={user}>
    <h2>Hello, {user.name}</h2>
  </header>

  <div d:switch={role}>
    <div d:case="'admin'">Admin tools</div>
    <div d:case="'manager'">Manager dashboard</div>
    <div d:default>Viewer mode</div>
  </div>

  <ul>
    <li d:for="(item, i) in items">
      {i + 1}. {item.title}
    </li>
  </ul>
</section>
```

---

# 📄 License

MIT

✨ Enjoy clean and elegant declarative control-flow inside your Astro templates with **astro-directify**!
