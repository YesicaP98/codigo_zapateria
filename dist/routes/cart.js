import { Router } from "express";
const router = Router();
// Cart is stored per-session in cookie-session
router.get("/", (req, res) => {
    const cart = req.session.cart || [];
    res.json(cart);
});
router.post("/add", (req, res) => {
    const { productId, qty } = req.body;
    if (!productId || qty == null || qty <= 0) {
        return res.status(400).json({ error: "Datos inválidos" });
    }
    const sess = req.session;
    sess.cart = sess.cart || [];
    const idx = sess.cart.findIndex((i) => i.productId === productId);
    if (idx >= 0)
        sess.cart[idx].qty += qty;
    else
        sess.cart.push({ productId, qty });
    res.json({ ok: true, cart: sess.cart });
});
router.post("/remove", (req, res) => {
    const { productId } = req.body;
    if (!productId)
        return res.status(400).json({ error: "productId requerido" });
    const sess = req.session;
    sess.cart = (sess.cart || []).filter((i) => i.productId !== productId);
    res.json({ ok: true, cart: sess.cart });
});
router.post("/clear", (req, res) => {
    req.session.cart = [];
    res.json({ ok: true, cart: [] });
});
export default router;
