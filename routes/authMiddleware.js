const bcrypt = require('bcryptjs');

const password = 'your_secret_password'; // Set your secret password here
const saltRounds = 10; // Salt rounds for bcrypt hashing

const hash = bcrypt.hashSync(password, saltRounds);

const authenticate = (req, res, next) => {
    const { password: enteredPassword } = req.body;

    // Check if password is provided in the request body
    if (!enteredPassword) {
        return res.status(401).send('Unauthorized'); // Password not provided, send unauthorized response
    }

    // Compare entered password with hashed password
    if (bcrypt.compareSync(enteredPassword, hash)) {
        next(); // Passwords match, proceed to next middleware
    } else {
        res.status(401).send('Unauthorized'); // Passwords do not match, send unauthorized response
    }
};

module.exports = authenticate;
