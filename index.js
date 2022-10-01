const express = require('express');
const cors = require('cors');
const path = require('path');

// Create the server
const app = express();

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/login/:uname',cors(), async(req, res, next) => {
  try {
    const uname = req.params.uname;
    res.json({success: true, login: true, uname: uname});
  } catch (err) {
    next(err)
  }
});

app.get('/api/logout/:uname',cors(), async(req, res, next) => {
  try {
    const uname = req.params.uname;
    res.json({success: true, logout: true, uname: uname});
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
