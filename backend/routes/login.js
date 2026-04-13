const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { JWT_SECRET } = require('../config/keys');

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : email;
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isMatch = false;

    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
      isMatch = false;
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
