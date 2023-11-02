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