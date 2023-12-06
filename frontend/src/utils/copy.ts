export default async function copy(context?: string) {
    if (!context) throw new Error("Context is empty.");
    await navigator.clipboard.writeText(context);
}
