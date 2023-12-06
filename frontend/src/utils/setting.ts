// const arr = new Uint8Array(20);
// window.crypto.getRandomValues(arr);
// const empty_value = Array.from(arr, v => v.toString(16).padStart(2, "0")).join("");

export default function setting(key: string, value: any=undefined, mode: "auto"|"read"|"write"="auto") {
    if (mode === "auto") mode = value === undefined ? "read" : "write";

    const dataString = localStorage.getItem("storage_data");
    let data;
    try {
        data = JSON.parse(dataString ?? "{}");
    } catch {data = {};}

    if (mode === "read") {
        const readValue = data[key] === "undefined" ? undefined : data[key];
        return readValue === undefined ? value : readValue;
    }
    else {
        if (value === undefined) return true;
        data[key] = value;
        try {
            const stringifyData = JSON.stringify(data);
            localStorage.setItem("storage_data", stringifyData);
            return true;
        } catch {
            return false;
        }
    }
}
