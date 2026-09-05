import { setCookie } from "hono/cookie";

const logout = (c) => {
    //maxAge -1 menyuuruh browser menghapus cookie nya
    setCookie(c, 'token', '', { maxAge: -1 });
    return c.json({ success: true, massage: 'Logout berhasil' })
};

export { logout }