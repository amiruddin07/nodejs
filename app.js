const express = require('express')
const config = require('./config.json')
var path = require('path');
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')




global.models = {};
const DBConnection = require('./config/db')

// Connect to Database
DBConnection();
const { auth, apiAuth } = require('./middleware/auth')
const app = express()

// Port Number
const port = config.PORT || 8080

// CORS Middleware
app.use(cors())

// Set Static Folder
// app.use(express.static(path.join(__dirname, 'public')))

// Body Parser Middliware
// app.use(bodyParser.json())

app.use(session({
    //  store: new RedisStore({host: 'localhost', port: 6379, client: redisClient, ttl: 7200000000}),
    secret: config.SECRET_KEY,
    resave: true,
    //rolling: true,
    saveUninitialized: true,
    cookie: {
      expires: 7200000000
    }
  }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ limit: "5mb", extended: true, parameterLimit: 50000 }));
app.use(express.json({ limit: '5mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));

// api auth middle errors
// app.use(apiAuth)

const apiRoute = require('./route/api')
apiRoute(app)

app.get('/', (req, res) => {
    res.send('Invalid endpoint!')
})

app.listen(port, () => {
    console.log('Listen : ' + port)
})