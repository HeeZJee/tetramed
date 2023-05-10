const { promisePool: pool } = require("../../../config/database");

async function insertOrder(order) {
    const {
        userid,
        customer_name,
        bill_material,
        main_bill,
        bill,
        material,
        branch_dc,
        amount,
        patient_name,
        ip_no,
        special_instructions,
        ts,
        order_ack,
        items,
    } = order;

    if (
        !userid ||
        !customer_name ||
        !bill_material ||
        !main_bill ||
        !bill ||
        !material ||
        !branch_dc ||
        !amount ||
        !patient_name ||
        !ip_no ||
        !special_instructions ||
        !ts ||
        !order_ack
    ) {
        return {
            error: true,
            message: "Invalid request!",
        };
    }

    const orderQuery = `INSERT INTO orders
            (userid, customer_name, bill_material, main_bill, bill, material,
            branch_dc, amount, patient_name, ip_no, special_instructions, ts, order_ack)
    VALUES  ('${userid}', '${customer_name}', '${bill_material}', '${main_bill}', '${bill}', '${material}',
            '${branch_dc}', '${amount}', '${patient_name}', '${ip_no}', '${special_instructions}', '${ts}', '${order_ack}')`;

    const [res] = await pool.query(orderQuery);

    const orderID = res.insertId;

    if (!orderID) {
        return {
            error: true,
            message: "Invalid request!",
        };
    }

    let count = 0;

    for await (const item of items) {
        const { item_name, quantity, metal_type, cat_no } = item;

        const itemsQuery = `INSERT INTO items
                (order_id, item_name, quantity, metal_type, cat_no) 
        VALUES  ('${orderID}', '${item_name}', '${quantity}', '${metal_type}', '${cat_no}')`;

        const [res] = await pool.query(itemsQuery);

        count += res.affectedRows;
    }

    return {
        error: false,
        message: "Order Inserted!",
        data: {
            orderID,
            affectedRows: count,
        },
    };
}

async function searchItems({ search_string }) {
    const query = `SELECT * FROM item_details_tbl WHERE itemname LIKE '%${search_string}%';`;

    const [rows] = await pool.query(query);

    return {
        error: false,
        message: "Fetched items.",
        data: rows,
    };
}

async function orderHistory({ date, userid }) {
    let query = `SELECT * FROM orders WHERE userid = '${userid}'`;

    if (date) {
        query += `AND CAST(created_time AS date) = '${date}'`;
    }

    const [rows] = await pool.query(query);

    const newRows = [];

    for await (const row of rows) {
        const { id } = row;

        const itemsQuery = `SELECT * FROM items WHERE order_id = '${id}';`;

        const [items] = await pool.query(itemsQuery);

        row.items = items;

        newRows.push(row);
    }

    return {
        error: false,
        message: "Fetched orders.",
        data: newRows,
    };
}

module.exports = { insertOrder, searchItems, orderHistory };
