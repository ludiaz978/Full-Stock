const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { apiCall, apiCallGetCompanyName } = require('./api'); 


const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'full_stock',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
}

// Route to fetch user's stocks for the dashboard
// app.get('/dashboard/stocks', authenticateToken, async (req, res) => {
//   try {
//     const query = 'SELECT * FROM stock_adds WHERE user_id = $1'; 
//     const { rows } = await pool.query(query, [req.user.user_id]);
//     res.status(200).json(rows);
//   } catch (error) {
//     console.error('Error fetching stocks for dashboard:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (rows.length > 0) {
      const isValid = await bcrypt.compare(password, rows[0].password);
      if (isValid) {
        const token = jwt.sign(
          { user_id: rows[0].user_id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        res.json({ token });
      } else {
        res.status(403).send('Invalid password');
      }
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(200).send("Registered successfully") 
  } catch (error) {
    console.error('Error during registration', error);
    res.status(500).send('Internal Server Error');
  }
})

// Logout endpoint
app.post('/logout', (req, res) => {
  res.status(200).send('Logged out successfully');
});

app.get('/search', async (req, res) => {
  console.log("server search")
  try {
    const searchQuery = req.query.q.toLowerCase();
    console.log("search query:", searchQuery);
    const responseData = await apiCall(searchQuery);
    const open = responseData.open;
    const symbol = responseData.symbol; 
    const close = responseData.close;
    const high = responseData.high;
    const low = responseData.low;
    const responseDataName = await apiCallGetCompanyName(searchQuery);
    const company_name = responseDataName.results.name;
    console.log("app.get /search company_name: ", company_name);
    //console.log("app get responseDataName", responseDataName);
    res.json({ company_name, open, symbol, close, high, low });
  } catch (error) {

    console.error('Error: Response data is null or missing open property');
    console.error('Error during search:', error);
    res.status(500).send('Internal Server Error');
  }
  })


app.get('/dashboard/stocks', async (req, res) => {
  console.log("app.get /db/stocks reached");
  try {
    const query = 'SELECT * FROM stock_adds';
    const { rows } = await pool.query(query);
    console.log("********************************")
    console.log("returned rows:", rows);
    res.status(200).json(rows);
    
  } catch (error) {
    console.error('error fetching stocks', error);
    res.status(500).send('Internal Server Error')
    
  }
  //code to call db and get stocks here
})

app.post('/add', async (req, res) => {
  const { open, symbol, company_name, close, high, low } = req.body; 
  try {
    await pool.query('INSERT INTO stock_adds (open, symbol, company_name, close, high, low, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [open, symbol, company_name, close, high, low, 1 ]);
    res.status(200).send("Stock added successfully");
  } catch (error) {
    console.error('Error during stock add:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
