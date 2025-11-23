# 🌌 astro-directify
### Declarative server-side control flow for Astro templates.

`astro-directify` adds **Vue/Svelte-like control‑flow directives** to Astro using safe, compile-time AST transforms.

Supported directives:

- `d:if`

### ✔ SSR‑only
### ✔ Zero client JavaScript
### ✔ Compile‑time transforms (no runtime cost)
### ✔ Works with React / Vue / Svelte islands
### ✔ Produces valid Astro output

---

## 🚀 Installation

```bash
npm install astro-directify
```

Enable the plugin in your Astro config:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import directify from 'astro-directify';

export default defineConfig({
  integrations: [directify()]
});
```

You're now ready to use directives in any `.astro` file.

---

# 🧩 Directives

## 🔹 `d:if` — Conditional Rendering

```astro
<button d:if={user}>Logout</button>
```

Compiles to:

```astro
{(user) && (<button>Logout</button>)}
```

# 🛡 Why astro-directify?

Astro encourages clean, server-first templates — but logic often becomes noisy:

```astro
{user && <div>Hello</div>}
{condition ? <A /> : <B />}
```

`astro-directify` keeps templates expressive and readable **without adding client-side weight**.

### ✔ AST-based (never regex)
### ✔ Pure compile-time transformation
### ✔ Zero client bundle impact
### ✔ Works with React/Vue/Svelte components
### ✔ 100% valid Astro syntax after transform

---

# 🔧 Compatibility

`astro-directify` works with:

- Astro SSR
- React components
- Vue & Svelte islands
- Tailwind
- Static output
- Server-only template logic
- MDX / Markdown (only inside JSX regions)

Output is guaranteed valid Astro JSX.

---

# 🧱 Example Dashboard

```astro
---
const { user, stats } = Astro.locals;
---

<div d:if={user}>
  <h2>Hello, {user.name}</h2>
</div>
```

---

# 📄 License

MIT

✨ Enjoy clean and elegant declarative control‑flow inside your Astro templates with **astro-directify**!
