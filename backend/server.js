require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
 origin: "*",
 methods: ["GET", "POST", "DELETE"],
 allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
 useNewUrlParser: true,
 useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB successfully"))
.catch((error) => console.error("❌ Error connecting to MongoDB:", error.message));

app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/metrics", require("./routes/metricRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.get("/health", (req, res) => {
 res.status(200).json({ status: "ok" });
});

app.use((err, req, res, next) => {
 console.error(err.stack);
 if (err.name === "UnauthorizedError") {
 return res.status(401).json({ message: "Invalid token or no token supplied" });
 }
 const statusCode = err.statusCode || 500;
 res.status(statusCode).json({
 message: err.message || "An unexpected error occurred",
 status: statusCode,
 });
});

app.use((req, res) => {
 res.status(404).json({ message: "Resource not found" });
});

app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));

process.on("unhandledRejection", (error) => {
 console.error("Unhandled Rejection:", error);
});