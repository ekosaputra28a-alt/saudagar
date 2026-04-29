import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGO_URI);
const dbName = process.env.DB_NAME;

let usersCollection;
let ordersCollection;
let menuCollection; // 🔥 TAMBAH INI

// 🔥 START SERVER SETELAH DB CONNECT
async function startServer() {
    try {
        await client.connect();

        const db = client.db(dbName);
        usersCollection = db.collection("users");
        ordersCollection = db.collection("orders");
        menuCollection = db.collection("menu"); // 🔥 TAMBAH INI (sesuai nama di Atlas)

        console.log("✅ MongoDB Connected");

        // =========================
        // ROUTES
        // =========================

        // ✅ GET USERS
        app.get("/users", async (req, res) => {
            try {
                const data = await usersCollection.find().toArray();
                res.json(data);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: "Gagal ambil data users" });
            }
        });

                // ✅ GET MENU (🔥 INI YANG KAMU BUTUH)
        app.get("/menu", async (req, res) => {
            try {
                const data = await menuCollection.find().toArray();
                res.json(data);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: "Gagal ambil menu" });
            }
        });

        // ✅ GET ORDERS (biar bisa dicek di browser)
        app.get("/orders", async (req, res) => {
            try {
                const data = await ordersCollection.find().toArray();
                res.json(data);
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: "Gagal ambil orders" });
            }
        });

        // ✅ POST ORDERS (🔥 INI INTI)
        app.post("/orders", async (req, res) => {
            try {
                console.log("📦 DATA MASUK:", JSON.stringify(req.body, null, 2));

                // 🔥 VALIDASI
                if (!req.body || !req.body.customer) {
                    return res.status(400).json({
                        error: "Data tidak valid"
                    });
                }

                const result = await ordersCollection.insertOne({
                    ...req.body,
                    createdAt: new Date()
                });

                res.status(201).json({
                    success: true,
                    message: "Order berhasil disimpan",
                    insertedId: result.insertedId
                });

            } catch (err) {
                console.error("❌ ERROR SIMPAN:", err);
                res.status(500).json({ error: "Gagal simpan data" });
            }
        });

                app.get("/", (req, res) => {
            res.send("API Burger jalan 🚀");
        });

        // =========================
        // START SERVER
        // =========================
        app.listen(5000, () => {
            console.log("🚀 Server jalan di http://localhost:5000");
        });

    } catch (err) {
        console.error("❌ Gagal konek MongoDB:", err);
    }
}

startServer();