import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

const me = (c) => {
    const token = getCookie(c, 'token');
    if (!token) return c.json({ success: false, massage: 'Unauthorized' }, 401);

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return c.json({ success: true, data: user });
    } catch (err) {
        return c.json({ success: false, massage: 'Token tidak valid' }, 401);
    }
};

export { me }