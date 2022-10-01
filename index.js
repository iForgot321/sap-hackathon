const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser')
// Create the server
const app = express();

const offices = ["Vancouver", "Vancouver, Washington"];

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.post('/api/login', cors(), async(req, res, next) => {
  try {
    const uname = req.body.uname;
    const office = req.body.office;
    res.json({success: true, login: true, uname: uname, office: office});
  } catch (err) {
    next(err)
  }
});

app.post('/api/logout', cors(), async(req, res, next) => {
  try {
    const uname = req.body.uname;
    const office = req.body.office;
    res.json({success: true, logout: true, uname: uname, office: office});
  } catch (err) {
    next(err)
  }
});

app.get('/api/offices', cors(), async(req, res, next) => {
  try {
    res.json({success: true, offices: offices});
  } catch (err) {
    next(err)
  }
});

// Anything that doesn't match the above, send back the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
});

// Choose the port and start the server
const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
  console.log(`Mixing it up on port ${PORT}`)
});
