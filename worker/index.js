const keys = require("./keys");
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // attempt to reconnet to server once every  1 second if it looses the connection
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

// used to calculate the fibonacci values 
// fibonacci recursive solution, not ideal but it simulates why we need a a sepertate worker process
function fib(index){
    if(index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// watch redis when a new value in inserted to redis so we can call fib funcion above
sub.on('message', (channel, message)=>{
    // calculate new fib value and insert taht intoa hashed called 'values', m
    // message value is index value submitted through form
    redisClient.hset('values', message, fib(parseInt(message)));
});

// anytime a new value is inserted below is called
sub.subscribe('insert');