export const apiEndPoint: string = process.env.NODE_ENV === "development" ?
    "http://localhost:8080" : "/api/v1";
