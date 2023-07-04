const express = require('express')
const bcryptjs = require('bcryptjs')
const connectDb = require('../db')
const router = express.Router()

// connect to database
const db = connectDb()

// get user detail
function getUser(username) {
    const query = 'SELECT * FROM users WHERE user_name = ?';
    return new Promise((resolve, reject) => {
        // run query to find user have 'user_name' equal to 'username'
        db.query(query, [username], function (err, result) {
            // if error, log error in console and reject with error
            if (err) {
                reject(err);
            } else { // else resolve with result
                resolve(result)
            }
        })
    })
}

// API to register user
router.post('/register', async (req, res) => {
    const { userName, password, email, mobile, user_name, companyId } = req.body;

    if (!userName || !password || !email || !mobile || !user_name || !companyId) return res.status(400).json({ error: "Invalid credentials" })

    const hashedPassword = await bcryptjs.hash(password, 16)
    const query = 'INSERT INTO users (userName, user_name, password, email, mobile, companyId) VALUES(?, ?, ?, ?, ?, ?)';
    db.query(query, [userName, user_name, hashedPassword, email, mobile, companyId], (err, result) => {
        if (err) {
            console.log("Error registering user: ", err)
            return res.status(500).json({ error: "Error Registering User" })
        }

        return res.status(201).json({ success: "User Registered" })
    })
})

// API to login user
router.post('/login', async (req, res) => {
    const { user_name, password } = req.body;

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9]{6,12}$/;
    if (!user_name || user_name.length < 6 || user_name.length > 12 || !usernameRegex.test(user_name)) {
        res.status(400).json({ error: 'Invalid username' });
        return;
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!password || password.length < 6 || !passwordRegex.test(password)) {
        res.status(400).json({ error: 'Invalid password' });
        return;
    }

    try {
        // get user detail
        const response = await getUser(user_name);

        // if response is empty, respond with error message
        if (response.length === 0) {
            return res.status(401).json({ error: "Invalid Credentials" })
        }

        // else get user from response
        const user = response[0]
        // compare input password with user hashed password
        const passwordMatch = await bcryptjs.compare(password, user.password);

        // if password did not match respond with error message
        if (!passwordMatch) {
            res.status(401).json({ error: "Invalid Credentials" })
            return;
        }

        // else return successful message
        res.status(200).json({ success: "Login Successful" })
    } catch (error) {
        console.log("Error retrieving user", error);
        return res.status(500).json({ error: "Something went wrong" })
    }
})

module.exports = router;