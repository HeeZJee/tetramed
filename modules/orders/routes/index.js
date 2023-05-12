const express = require("express");
const { insertOrder, searchItems, orderHistory } = require("../services/orders.service");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello from orders.");
});

router.post("/order", async (req, res) => {
    console.log("**** +++ Came inside");
    const result = await insertOrder(req.body);

    res.json(result);
});

router.post("/items/search", async (req, res) => {
    const result = await searchItems(req.body);

    res.json(result);
});

router.post("/history", async (req, res) => {
    const result = await orderHistory(req.body);

    res.json(result);
});

module.exports = router;
