const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ 
    secret: "fingerprint_customer", 
    resave: true, 
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false } // Ensure this works for your environment
}));

// Authentication middleware for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
    console.log(req.session);  // For debugging

    if (req.session && req.session.authorization) {
        let token = req.session.authorization.token;

        jwt.verify(token, 'my-secret-key', (err, user) => {
            if (err) {
                // Token verification failed
                return res.status(401).json({ error: 'Token verification failed' });
            } else {
                req.session.user = user;  // Store user information in session
                next();  // Continue to the next middleware or route
            }
        });
    } else {
        return res.status(401).json({ error: 'Unauthorized, no session found' });
    }
});

const PORT = 5000;

// Register the routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
