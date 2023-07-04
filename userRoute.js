const express = require('express')
const connectDb = require('../db')

const router = express.Router()

// get employees of a company
function getEmployee(companyId) {
    const db = connectDb()
    const query = 'SELECT userId, userName, user_name, email, mobile, companyId FROM users WHERE companyId = ?'
    return new Promise((resolve, reject) => {
        // run query to get all users whose company id equal to 'companyId' parameter
        db.query(query, [companyId], function(err, result) {
            // if error, log error in console and reject with error
            if (err) {
                console.log(err)
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

router.get('/getEmp/:companyId', async (req, res) => {
    // get company id from parameter
    const { companyId } = req.params;

    // if company id is not provided return appropriate message
    if (!companyId) {
        return res.status(400).send("Company Id not given")
    }

    try {
        // get employees of same company id from database and send it as a response
        const employees = await getEmployee(companyId)
        res.status(200).json(employees)
    } catch (error) {
        console.log('Error while getting employee', error);
        return res.status(500).json(error)
    }
})

module.exports = router;