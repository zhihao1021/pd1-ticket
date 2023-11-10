export function downloadBlob(data: Blob | MediaSource, fileName: string): boolean {
    const downloadElement: HTMLAnchorElement | null = document.getElementById("downloadATagUnderBody") as HTMLAnchorElement | null;
    if (downloadElement === null) return false;
    const url = URL.createObjectURL(data);
    downloadElement.href = url;
    downloadElement.download = fileName;
    downloadElement.click();
    downloadElement.href = "";
    downloadElement.download = "";
    URL.revokeObjectURL(url);
    return true;
}

export function copy(context?: string, name?: string, func?: (s: string) => void) {
    if (context === null || context === undefined) {
        if (func !== undefined) func(`複製${name}失敗`);
        return;
    }
    navigator.clipboard.writeText(context).then(() => {
        if (func !== undefined) func(`複製${name}成功`);
    }).catch(() => {
        if (func !== undefined) func(`複製${name}失敗`);
    });
}