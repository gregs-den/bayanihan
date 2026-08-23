export function getUserIdFromToken(): number | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.userId;
    } catch {
        return null;
    }
}

export function isAdminFromToken(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const payload = token.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        return !!decoded.isAdmin;
    } catch {
        return false;
    }
}