const { Client, Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const databaseFromConfig = process.env.DATABASE_URL;
const heroku = !!databaseFromConfig;

let client = null;
let pool = null;
let dbname = heroku ? databaseFromConfig.split('/').pop() : 'sapdb';
if (heroku) {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        database: dbname, // name of the database
        max: 10, // max number of clients in the pool
        idleTimeoutMillis: 30000
    });
} else {
    client = new Client({
        host: '127.0.0.1',
        user: 'postgres',
        password: process.env.DATABASE_PASS ? process.env.DATABASE_PASS : '',
        port: 5432,
    });
    pool = new Pool({
        user: 'postgres', // name of the user account
        password: process.env.DATABASE_PASS ? process.env.DATABASE_PASS : '',
        database: dbname, // name of the database
        max: 10, // max number of clients in the pool
        idleTimeoutMillis: 30000
    });
}

const userTable = `
    CREATE TABLE IF NOT EXISTS "users" (
	    "name" VARCHAR(100),
	    "user_id" VARCHAR(100) NOT NULL,
        "picture_url" VARCHAR(100),
        "amenity_id" INT,
        "office_id" VARCHAR(100),
	    PRIMARY KEY (user_id),
        CONSTRAINT fk_amenity
            FOREIGN KEY(amenity_id)
                REFERENCES amenities(amenity_id),
        CONSTRAINT fk_office_user
            FOREIGN KEY(office_id)
                REFERENCES offices(office_id)
    );`;

const officeTable = `
    CREATE TABLE IF NOT EXISTS "offices" (
	    "office_id" VARCHAR(100) NOT NULL,
	    PRIMARY KEY (office_id)
    );`;

const roomTable = `
    CREATE TABLE IF NOT EXISTS "rooms" (
	    "room_id" INT GENERATED ALWAYS AS IDENTITY,
	    "name" VARCHAR(100) NOT NULL,
        "office_id" VARCHAR(100) NOT NULL,
	    PRIMARY KEY(room_id),
        CONSTRAINT fk_office_room
            FOREIGN KEY(office_id)
                REFERENCES offices(office_id)
    );`;

const amenityTable = `
    CREATE TABLE IF NOT EXISTS "amenities" (
	    "amenity_id" INT GENERATED ALWAYS AS IDENTITY,
	    "name" VARCHAR(100) NOT NULL,
        "room_id" INT,
        "image_url" VARCHAR(100),
        "capacity" INT NOT NULL,
	    PRIMARY KEY (amenity_id),
        CONSTRAINT fk_room
            FOREIGN KEY(room_id)
                REFERENCES rooms(room_id)
    );`;

const logTable = `
    CREATE TABLE IF NOT EXISTS "activity_log" (
	    "log_id" INT GENERATED ALWAYS AS IDENTITY,
	    "amenity_id" INT NOT NULL,
	    "user_id" VARCHAR(100) NOT NULL,
	    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
	    PRIMARY KEY (log_id),
        CONSTRAINT fk_amenity_log
            FOREIGN KEY(amenity_id)
                REFERENCES amenities(amenity_id),
        CONSTRAINT fk_user_log
            FOREIGN KEY(user_id)
                REFERENCES users(user_id)
    );`;

module.exports.createTables = async () => {
    console.log("Creating tables...");
    const clientDB = await pool.connect();
    // await clientDB.query("drop schema public cascade;").catch(err => {
    //     console.log("drop schema error");
    //     console.error(err.stack);
    // });
    // await clientDB.query("create schema public;").catch(err => {
    //     console.log("create schema error");
    //     console.error(err.stack);
    // });
    await clientDB.query(officeTable).catch(err => {
        console.log("officeTable error");
        console.error(err.stack);
    });
    await clientDB.query(roomTable).catch(err => {
        console.log("roomTable error");
        console.error(err.stack);
    });
    await clientDB.query(amenityTable).catch(err => {
        console.log("amenityTable error");
        console.error(err.stack);
    });
    await clientDB.query(userTable).catch(err => {
        console.log("userTable error");
        console.error(err.stack);
    });
    await clientDB.query(logTable).catch(err => {
        console.log("logTable error");
        console.error(err.stack);
    });
    console.log('+++++ All tables exist or were successfully created');

    await clientDB.release();         // closes connection
    return true;
};

module.exports.createDatabase = async () => {
    if (heroku) {
        return true;
    }

    try {
        console.log("Creating database...");
        await client.connect();                            // gets connection
        await client.query(`CREATE DATABASE ${dbname}`); // sends queries
        return true;
    } catch (error) {
        if (error.stack.includes("already exists")) {
            console.log("Database already exists, moving on");
            return true;
        }

        console.error(error.stack);
        return false;
    } finally {
        await client.end();                                // closes connection
    }
};

module.exports.login = async (user_id, office) => {
    const clientDB = await pool.connect();
    try {
        console.log("logging in user " + user_id + " in office " + office);
        const query = 'SELECT * FROM users WHERE user_id=\''+user_id+'\';';
        const result = await clientDB.query(query);
        if (result.rowCount === 0) {
            return result;
        }
        const query2 = 'UPDATE users SET office_id=\''+ office +'\' WHERE user_id=\''+user_id+'\';';
        console.log(query2);
        await clientDB.query(query2);
        return result;
    } catch (error) {
        console.error(error.stack);
        return undefined;
    } finally {
        clientDB.release();
    }
}

module.exports.logout = async (user_id) => {
    const clientDB = await pool.connect();
    try {
        console.log("logging out user " + user_id);
        const query2 = 'UPDATE users SET office_id=NULL, amenity_id=NULL WHERE user_id=\''+user_id+'\';';
        console.log(query2);
        await clientDB.query(query2);
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    } finally {
        clientDB.release();
    }
}

module.exports.getOffices = async () => {
    const clientDB = await pool.connect();
    try {
        console.log("getting list of offices");
        const query = 'SELECT * FROM offices;';
        const result = await clientDB.query(query);
        return result;
    } catch (error) {
        console.error(error.stack);
        return undefined;
    } finally {
        clientDB.release();
    }
}

module.exports.getOfficeUsers = async (office) => {
    const clientDB = await pool.connect();
    try {
        console.log("getting list of users");
        const query = 'SELECT u.name as name, u.user_id as id, u.picture_url as image, r.name as room FROM users u LEFT JOIN amenities a ON u.amenity_id=a.amenity_id LEFT JOIN rooms r ON r.room_id=a.room_id WHERE u.office_id=\'' + office + '\' ;';
        console.log(query);
        const result = await clientDB.query(query);
        return result;
    } catch (error) {
        console.error(error.stack);
        return undefined;
    } finally {
        clientDB.release();
    }
}

module.exports.getAmenities = async (office) => {
    const clientDB = await pool.connect();
    try {
        console.log("getting list of amenities");
        const query = `SELECT a.amenity_id as a_id, a.name as a_name, r.name as r_name, a.image_url as image, a.capacity as capacity, u.name as u_name, u.user_id as u_id, u.picture_url as u_image
    FROM amenities a LEFT JOIN rooms r ON a.room_id=r.room_id 
    LEFT JOIN users u ON a.amenity_id=u.amenity_id
    LEFT JOIN offices o ON r.office_id=o.office_id WHERE o.office_id='${office}';`;
        console.log(query);
        const result = await clientDB.query(query);
        return result;
    } catch (error) {
        console.error(error.stack);
        return undefined;
    } finally {
        clientDB.release();
    }
}

module.exports.joinAmenity = async (user_id, amenity) => {
    const clientDB = await pool.connect();
    try {
        console.log("user " + user_id + " joining amentity " + amenity);
        const query2 = 'UPDATE users SET amenity_id=\'' + amenity + '\' WHERE user_id=\''+user_id+'\';';
        console.log(query2);
        await clientDB.query(query2);
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    } finally {
        clientDB.release();
    }
}

module.exports.leaveAmenity = async (user_id) => {
    const clientDB = await pool.connect();
    try {
        console.log("user " + user_id + " leaving amentity");
        const query2 = 'UPDATE users SET amenity_id=NULL WHERE user_id=\''+user_id+'\';';
        console.log(query2);
        await clientDB.query(query2);
        return true;
    } catch (error) {
        console.error(error.stack);
        return false;
    } finally {
        clientDB.release();
    }
}

module.exports.getUser = async (user_id) => {
    const clientDB = await pool.connect();
    try {
        console.log("getting user " + user_id);
        const query2 = 'SELECT * FROM users WHERE user_id=\''+user_id+'\';';
        console.log(query2);
        const result = await clientDB.query(query2);
        return result;
    } catch (error) {
        console.error(error.stack);
        return undefined;
    } finally {
        clientDB.release();
    }
}

module.exports.getAmenityStatistics = async (amenity) => {

}


