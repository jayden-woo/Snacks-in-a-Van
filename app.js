// packages or schema imports
const cookieParser = require('cookie-parser')
const exphbs = require('express-handlebars')
const express = require('express')
const flash = require('connect-flash-plus')
const helmet = require('helmet')
const passport = require('passport')
const session = require('express-session')
const app = express()
const server = require('http').createServer(app)
const socket = require('socket.io')
const io = socket(server)

// listen to socket connections
io.on('connection', (socket) => {
    console.log('a user connected')
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})

// bind the io reference to every incoming request
app.use( (req, res, next) => {
    req.io = io
    return next()
})

// define where static assets live
app.use(express.static('public')) 

// set the template engine to handlebars
app.engine('hbs', exphbs({
    defaultlayout: 'main',
    extname: 'hbs',
    helpers: require(__dirname + "/public/js/helpers.js").helpers
}))

// set the view engine to hds engine above
app.set('view engine', 'hbs')

// declare sources for the HTTP Content-Security-Policy
const imgSrc = [
    "'self'", 
    "data:", 
    "https://source.unsplash.com/", 
    "https://images.unsplash.com/"
]
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js",
  "https://code.getmdl.io/1.3.0/material.min.js",
  "https://cdn.jsdelivr.net/npm/jquery",
  "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js",
  "https://cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/alertify.min.js",
];

// set up HTTP headers for web app security
// app.use(helmet({
//     contentSecurityPolicy: {
//         directives: {
//             ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//             "img-src": imgSrc, 
//             "script-src": scriptSrc, 
//             "script-src-attr": scriptSrc, 
//             "script-src-elem": scriptSrc
//         }
//     }
// }))

// use flash to store messages
app.use(flash())

// set up database
const db = require('./models/db.js')

// set up session to keep track of user data in between requests
app.use(cookieParser())
app.use(
  session({
    secret: "INFO30005 Web-App",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // user should log in again after restarting the browser
      expires: false,
      // 2 hours before cookies expire and have to log in again
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: false,
    },
  })
);

// configure the passport to handle authentication
app.use(passport.initialize())
app.use(passport.session())

// set up the passport strategies
require('./config/passport').configPassport(passport)

// for reading body of requests
app.use(express.json())  // json format
app.use(express.urlencoded({extended:true}))  // urlencoded format

// set up the routers
const customerRouter = require('./routes/customerRouter')
const vendorRouter =  require('./routes/vendorRouter')
const indexRouter = require('./routes/indexRouter')

// handler for customer requests and routes are added onto the end of '/customer'
app.use('/customer', customerRouter)

// handler for vendor requests and routes are added onto the end of '/vendor'
app.use('/vendor', vendorRouter)

// any other routes are redirected to the general index router
app.use('/', indexRouter)

// dynamically set the port number or use static 8080 port for local testing
const port = process.env.PORT || 8080

// listen to any request to the web app
server.listen(port, () => {
    console.log('The web app is listening on port', port)
})

module.exports = app