export const getTokenFromCookie = () => {
    const token = document.cookie.split(";").find(row => row.trim().startsWith("token="))?.split("=")[1];
    return token;
}