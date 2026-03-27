const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/home.html"));
});
app.get("/categories", (req, res) => {
    db.query("SELECT * FROM categories", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});
app.post("/add-category", (req, res) => {
    const { name } = req.body;
    db.query(
        "INSERT INTO categories (name) VALUES (?)",
        [name],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Category Added" });
        }
    );
});
app.get("/expenses", (req, res) => {
    db.query(`
        SELECT expenses.id, categories.name AS category,
               expenses.amount, expenses.expense_date, expenses.note
        FROM expenses
        JOIN categories ON expenses.category_id = categories.id
        ORDER BY expenses.id DESC
    `, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.post("/add-expense", (req, res) => {
    const { category_id, amount, expense_date, note } = req.body;

    db.query(
        "INSERT INTO expenses (category_id, amount, expense_date, note) VALUES (?, ?, ?, ?)",
        [category_id, amount, expense_date, note],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Expense Added" });
        }
    );
});

app.delete("/delete-expense/:id", (req, res) => {
    db.query(
        "DELETE FROM expenses WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Expense Deleted" });
        }
    );
});

app.get("/income", (req, res) => {
    db.query("SELECT * FROM income ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.post("/add-income", (req, res) => {
    const { amount, income_date } = req.body;

    db.query(
        "INSERT INTO income (amount, income_date) VALUES (?, ?)",
        [amount, income_date],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Income Added" });
        }
    );
});
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000 🚀");
});