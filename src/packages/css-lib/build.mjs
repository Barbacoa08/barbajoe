import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import browserslist from "browserslist";
import { browserslistToTargets, bundle, Features } from "lightningcss";

const output = new URL("./dist/", import.meta.url);
const { code } = bundle({
	filename: fileURLToPath(new URL("./lib/barbajoe.css", import.meta.url)),
	minify: true,
	targets: browserslistToTargets(browserslist(">= 0.25%")),
	// Current supported browsers implement :dir(). Its language-based fallback
	// changes explicit and auto direction semantics, including generated logical
	// property selectors. Preserve the native selector without changing targets
	// or the package's existing system-preference theme compilation.
	exclude: Features.DirSelector,
});
await mkdir(output, { recursive: true });
await writeFile(new URL("barbajoe.css", output), code);
