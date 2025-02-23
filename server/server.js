const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Sample Schema and Model
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
});
const User = mongoose.model("User", UserSchema);

// API Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Add a new user
app.post("/add-user", async (req, res) => {
    const { name, email } = req.body;
    try {
        const newUser = new User({ name, email });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
