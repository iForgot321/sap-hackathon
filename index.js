const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser')
// Create the server
const app = express();

const offices = ["Vancouver", "Vancouver, Washington"];
let amenities = [
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
        'email': '111@company.com',
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
        'email': '112@company.com',
        'name': 'Jane Doe',
        'image': 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      }, {
        'email': '113@company.com',
        'name': 'John Smith',
        'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
      }, {
        'email': '114@company.com',
        'name': 'Mark Front',
        'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
      }, {
        'email': '115@company.com',
        'name': 'Harry Meter',
        'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
      }
    ],
  },
];

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.get('/api/amenities/:office', cors(), async(req, res, next) => {
  try {
    res.json({amenities});
  } catch (err) {
    next(err)
  }
});

app.post('/api/amenities/login/:amenity', cors(), async(req, res, next) => {
  try {
    const amenity = req.params.amenity;
    const uname = req.body.uname;
    let index = amenities.findIndex((what) => what['id'] == amenity);
    if (index >= 0) {
      amenities[index].people.push({
        'email': uname,
        'name': 'your mom',
        'image': 'https://thumbs.dreamstime.com/b/profile-picture-caucasian-male-employee-posing-office-happy-young-worker-look-camera-workplace-headshot-portrait-smiling-190186649.jpg',
      });
      res.json({success: true, amenities: amenities});
    } else {
      res.json({success: false});
    }
  } catch (err) {
    next(err);
  }
});

app.post('/api/amenities/logout/:amenity', cors(), async(req, res, next) => {
  try {
    const amenity = req.params.amenity;
    const uname = req.body.uname;
    let index = amenities.findIndex((what) => what['id'] == amenity);
    if (index >= 0) {
      let personIndex = amenities[index].people.indexOf(person => person.email === uname);
      amenities[index].people.splice(personIndex,1);
      res.json({success: true, amenities: amenities});
    } else {
      res.json({success: false});
    }
  } catch (err) {
    next(err);
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

app.get('/api/online/:office', cors(), async(req, res, next) => {
  try {
    const office = req.params.office;
    res.json({success: true, people: [
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://st.depositphotos.com/1727324/1320/i/600/depositphotos_13209360-stock-photo-square-canvas-on-a-stretcher.jpg",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png"
        },{
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://st.depositphotos.com/1727324/1320/i/600/depositphotos_13209360-stock-photo-square-canvas-on-a-stretcher.jpg",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png"
        },{
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://st.depositphotos.com/1727324/1320/i/600/depositphotos_13209360-stock-photo-square-canvas-on-a-stretcher.jpg",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png"
        },{
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://st.depositphotos.com/1727324/1320/i/600/depositphotos_13209360-stock-photo-square-canvas-on-a-stretcher.jpg",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png"
        },{
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://st.depositphotos.com/1727324/1320/i/600/depositphotos_13209360-stock-photo-square-canvas-on-a-stretcher.jpg",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png"
        },{
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://st.depositphotos.com/1727324/1320/i/600/depositphotos_13209360-stock-photo-square-canvas-on-a-stretcher.jpg",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png",
          room: "Game Room"
        },
        {
          name: "John Doe",
          id: "johndoe@example.com",
          image: "https://z0rb14n.github.io/images/cat.png"
        },
      ]});
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
