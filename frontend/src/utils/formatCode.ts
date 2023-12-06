import init, { format } from "@wasm-fmt/clang-format";

let inited = false;
init().then(() => {
    inited = true;
})

export default function formatCode(code: string) {
    if (!inited) return code;
    return format(code, "", JSON.stringify({
        BasedOnStyle: "Google",
        IndentWidth: 4,
        ColumnLimit: 0,
    }));
}
