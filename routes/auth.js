const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
dotenv.config();

// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required.
router.post('/createuser', [
    body('name', "Name must have atleast 3 characters.").isLength({ min: 3 }),
    body('email', "Enter a valid email.").isEmail(),
    body('password', "Password must have atleast 4 characters.").isLength({ min: 4 }),
], async (req, res) => {

    // If there are errors, return Bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let msg = errors.errors[0].msg;
        console.log(errors);
        return res.status(400).json({ success: false, msg});
    }

    try {
        // Check whether the user with this email exists already.
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ success: false, msg: "Sorry a user with this email already exists." });
        }
        // Create a new user
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        });

        let username = req.body.name;

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        res.json({ success: true , authtoken, username });

    } catch (error) {
        res.status(500).send("Internal sever Error.");
        console.log(error.message);
    }
});

// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required.
router.post('/login', [
    body('email', "Enter a valid email.").isEmail(),
    body('password', "Password cannot be blank.").isLength({ min: 1 }),
], async (req, res) => {

    // If there are errors, return Bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let msg = errors.errors[0].msg;
        return res.status(400).json({ success: false, msg});
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, msg: "Please try to login with correct credentials." });
        }

        const passwordcomapare = await bcrypt.compare(password, user.password);
        if (!passwordcomapare) {
            return res.status(400).json({ success: false, msg: "Please try to login with correct credentials." });
        }
        let username = user.name;
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        res.json({ success: true , authtoken, username });

    } catch (error) {
        res.status(500).send("Internal sever Error.");
        console.log(error.message);
    }
});

// ROUTE 3: Get loggedin User details using: POST "/api/auth/getuser". Login required.
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        res.status(500).send("Internal sever Error.");
        console.log(error.message);
    }
});

module.exports = router;