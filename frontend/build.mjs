import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
     entryPoints: {
        main: "src/main.ts",
        // settings: "src/settings.ts",
        // welcome: "src/welcome.ts",
    },
    outdir: "build",
    bundle: true,
    splitting: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    sourcemap: true,
    loader: {
    '.png': 'file', // Copies PNGs to the output folder and returns their path URL
    // '.png': 'dataurl', // Alternatively: inlines the PNG as a Base64 string
  },
});

if (watch) {
    await ctx.watch();
    console.log("⚡ esbuild watching...");
} else {
    await ctx.rebuild();
    await ctx.dispose();
}