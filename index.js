const express = require('express');
const cors = require('cors');
const path = require('path');

const {createDatabase, createTables, login, getOffices, logout, getOfficeUsers, getAmenities, joinAmenity, getUser, leaveAmenity} = require("./database");

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

const bodyParser = require('body-parser');
// Create the server
const app = express();


// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.post('/api/amenities/:office', cors(), async(req, res, next) => {
  const office = req.params.office;
  const user_id = req.body.uname;

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
      const r = result.rows[i];
      if (i !== 0 && result.rows[i].a_id === result.rows[i-1].a_id) {
        body.amenities[body.amenities.length - 1].people.push({
          email: r.u_id,
          name: r.u_name,
          image: r.u_image
        });
        if (r.u_id === user_id) {
          body.amenities[body.amenities.length-1].here = true;
        }
      } else {
        body.amenities.push({
          id: r.a_id,
          name: r.a_name,
          room: r.r_name,
          image: r.image,
          capacity: r.capacity,
          here: false,
          people: []
        });
        if (r.u_id) {
          body.amenities[body.amenities.length-1].people.push({
            email: r.u_id,
            name: r.u_name,
            image: r.u_image
          })
          if (r.u_id === user_id) {
            body.amenities[body.amenities.length-1].here = true;
          }
        }
      }
    }
    res.json(body);
  });
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
          office_image: result.rows[0].image_url
        }
        console.log(body);
        res.json(body);
      }
    });
});
app.post('/api/amenities/login/:amenity', cors(), async(req, res, next) => {
  const amenity = req.params.amenity;
  const user_id = req.body.uname;

  joinAmenity(user_id, amenity).then((result) => {
    if (result) {
      res.json({success: true});
    } else {
      res.json({success: false, message: "Database Error"});
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

app.post('/api/amenities/logout/:amenity', cors(), async(req, res, next) => {
  const user_id = req.body.uname;

  leaveAmenity(user_id).then((result) => {
    if (result) {
      res.json({success: true});
    } else {
      res.json({success: false, message: "Database Error"});
    }
  });
});

app.get('/api/user/:user', cors(), async(req, res, next) => {
  const user_id = req.params.user;

  getUser(user_id).then((result) => {
    if (result === undefined) {
      res.json({success: false, message: "Database Error"});
      return;
    }

    const body = {
      success: true,
      name: result.rows[0].name,
      image: result.rows[0].picture_url,
      office_image: result.rows[0].image_url
    }
    console.log(body);
    res.json(body);
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

    const userMap = {}
    for (let user of result.rows) {
      const userId = user.id;
      if (userMap[userId] && user.used_amenity_name) {
        userMap[userId].usedAmenities.push(user.used_amenity_name);
      } else {
        userMap[userId] = {
          id: user.id,
          name: user.name,
          image: user.image,
          room: user.room,
          usedAmenities: user.used_amenity_name ? [user.used_amenity_name] : [],  // used_amenity_name may be null
        };
      }
    }

    const body = {
      success: true,
      people: Object.values(userMap),
    }
    res.json(body);
  });
});

app.get('/api/amenities/stats/:amenity', cors(), async(req, res, next) => {
  const body = {
    success: true,
    lastUsedTime: "Sat January 1, 2023",
    lastUsedUser: 'John Doe',
    popularDay: 'Wednesday',
    topUsers: [
      "Test One",
      "Test Two",
      "Peiyan Yang"
    ]
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
