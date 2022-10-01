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

app.get('/api/amenities', cors(), async(req, res, next) => {
  try {
    res.json({amenities: [
        {
          'id': 1,
          'name': 'Pool Table 1',
          'room': 'Game Room',
          'capacity': 2,
          'people': [
            {
              'email': 'abc@company.com',
              'name': 'Jane Doe',
              'image': 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            }, {
              'email': 'def@company.com',
              'name': 'John Smith',
              'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
            }
          ],
        },
        {
          'id': 2,
          'name': 'Pool Table 2',
          'room': 'Game Room',
          'capacity': 2,
          'people': [],
        },
        {
          'id': 3,
          'name': 'Treadmill',
          'room': 'Gym',
          'capacity': 1,
          'people': [],
        },
      ]});
  } catch (err) {
    next(err)
  }
});

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
