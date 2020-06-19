const keys = require('./keys');
const epxress = require('express');
const redis = require('redis');
const cors = require('cors');

const app = epxress();
app.use(cors());
app.use(epxress.json);

//postgress client set up

const { Pool } = require('pg');

const pgClient = new Pool({
    user: keys.pgUser,
    host:keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG connection'));

// we must create a table before connecting to a SQL database
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err)=> console.log(err));


// redis client set up
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // attempt to reconnet to server once every  1 second if it looses the connection
    retry_strategy: () => 1000
});
// if we ever have a client which is publishing or listening information in redis we must make duplicate connection
const redisPublisher = redisClient.duplicate();

//express route handler

app.get('/', (req, res)=>{
    res.send('hi')    
});

// to query and retreve all values (indices) submitted to application 
app.get('/values/all', async (req, res)=>{
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows); // .rows will only send back the values from table and not metadata (how long query took)
});

// reach to redis to retrive all indices and calculated vlaues for each index
app.get('/values/current', async (req, res)=>{
    // redis library for node js does not have a prmise support so
    // we use classic callback approach
    redisClient.hgetall('values', (err, values)=>{
        res.send(values)
    })
    res.send(values.rows); // .rows will only send back the values from table and not metadata (how long query took)
});

app.post('/values', async (req, res)=>{

    const index = req.body.index;

    if(parseInt(index) >= 40) {
        return res.status(422).send("Index too high!")
    }

    // nothing yet means we are yet calculate a value
    redisClient.hset('values', index, 'Nothing yet!');

    // send message to worker process to wake it up and  asks it pull a new value from redis and calculate fib value   
    redisPublisher.publish('insert', index)

    // store index from fronent end to database
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send({ working: true});
});

//const PORT = 5000 || process.env.PORT;

app.listen(5000, ()=>{
    console.log("Server is listening!");
});