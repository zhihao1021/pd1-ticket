import axios from "axios";

export default async function login(username: string, password: string) {
    const response = await axios.postForm("/oauth/login", {
        username: username,
        password: password
    });

    const responseData: Readonly<{
        access_token: string,
        token_type: string
    }> = response.data

    localStorage.setItem("access_token", responseData.access_token);
    localStorage.setItem("token_type", responseData.token_type);
}
