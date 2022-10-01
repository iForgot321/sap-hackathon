const express = require('express');
const cors = require('cors');
const path = require('path');

const {createDatabase, createTables, login, getOffices, logout, getOfficeUsers, getAmenities} = require("./database");

createDatabase().then((result) => {
  if (result) {
    console.log('Database created');
    createTables().then(result => {
      if (result) {
        console.log('Tables created');
      } else {
        console.log('bad news');
      }
    });
  }
});

const bodyParser = require('body-parser')
// Create the server
const app = express();

//const offices = ["Vancouver", "Vancouver, Washington"];

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.get('/api/amenities/:office', cors(), async(req, res, next) => {
  const office = req.params.office;

  getAmenities(office).then((result) => {
    if (result === undefined) {
      res.json({success: false, message: "Database Error"});
      return;
    }

    let body = {
      success: true,
      amenities: []
    };
    for (let i = 0; i < result.rowCount; i++) {
      if (i !== 0 && result.rows[i].a_id === result.rows[i-1].a_id) {
        body.amenities[body.amenities.length - 1].people.push(result.rows[i].u_name);
      } else {
        const r = result.rows[i];
        body.amenities.push({
          id: r.a_id,
          name: r.a_name,
          room: r.r_name,
          image: r.image,
          capacity: r.capacity,
          people: [r.u_name]
        });
      }
    }
    console.log(body);
    res.json(body);
  });

  try {
    res.json({amenities: [
        {
          'id': 1,
          'name': 'Pool Table 1',
          'room': 'Game Room',
          'image': 'https://www.homestratosphere.com/wp-content/uploads/2018/05/game-room-billiards-table-may16-2018.jpg',
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
          'image': 'https://www.homestratosphere.com/wp-content/uploads/2018/05/game-room-billiards-table-may16-2018.jpg',
          'capacity': 2,
          'people': [],
        },
        {
          'id': 3,
          'name': 'Treadmill',
          'room': 'Gym',
          'image': 'https://www.yanrefitness.com/wp-content/webpc-passthru.php?src=https://www.yanrefitness.com/wp-content/uploads/2020/09/How-to-Start-a-Corporate-Gym-1.jpg&nocache=1',
          'capacity': 1,
          'people': [
            {
              'email': 'def@company.com',
              'name': 'Jane Smith',
              'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
            }
          ],
        },
        {
          'id': 4,
          'name': 'Ping Pong Table 1',
          'room': 'Gym',
          'image': 'https://www.yanrefitness.com/wp-content/webpc-passthru.php?src=https://www.yanrefitness.com/wp-content/uploads/2020/09/How-to-Start-a-Corporate-Gym-1.jpg&nocache=1',
          'capacity': 1,
          'people': [
            {
              'email': 'abc@company.com',
              'name': 'Jane Doe',
              'image': 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            }, {
              'email': 'def@company.com',
              'name': 'John Smith',
              'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
            }, {
              'email': 'alskj@company.com',
              'name': 'Mark Front',
              'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
            }, {
              'email': '09d8sj@company.com',
              'name': 'Harry Meter',
              'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
            }
          ],
        },
      ]});
  } catch (err) {
    next(err)
  }
});

app.post('/api/login', cors(), async(req, res, next) => {
    const user_id = req.body.user_id;
    const office = req.body.office;

    login(user_id, office).then((result) => {
      if (result === undefined) {
        res.json({success: false, message: "Database Error"});
      } else if (result.rowCount === 0) {
        res.json({success: false, message: "User Not Found"});
      } else {
        const body = {
          success: true,
          name: result.rows[0].name,
          image: result.rows[0].picture_url,
        }
        console.log(body);
        res.json(body);
      }
    });
});

app.post('/api/logout', cors(), async(req, res, next) => {
  logout(req.body.user_id).then((result) => {
    if (result === undefined) {
      res.json({success: false, message: "Database Error"});
      return;
    }

    res.json({success: true});
  });

});

app.get('/api/offices', cors(), async(req, res, next) => {
  getOffices().then((result) => {
    if (result === undefined) {
      res.json({success: false, message: "Database Error"});
      return;
    }

    const body = {
      success: true,
      offices: result.rows.map(val => val.office_id),
    }
    console.log(body);
    res.json(body);
  });
});

app.get('/api/online/:office', cors(), async(req, res, next) => {
  const office = req.params.office;
  getOfficeUsers(office).then((result) => {
    if (result === undefined) {
      res.json({success: false, message: "Database Error"});
      return;
    }

    const body = {
      success: true,
      people: result.rows
    }
    console.log(body);
    res.json(body);
  });
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
