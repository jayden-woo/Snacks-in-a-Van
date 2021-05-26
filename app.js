// packages or schema imports
const cookieParser = require('cookie-parser')
const express = require('express')
const flash = require('connect-flash-plus')
const helmet = require('helmet')
const passport = require('passport')
const session = require('express-session')
const app = express()

// app.use(express.static('public')) // define where static assets live

// const exphbs = require('express-handlebars')

// app.engine('hbs', exphbs({
//     defaultlayout: 'main',
//     extname: 'hbs',
//     helpers: require(__dirname + "/public/js/helpers.js").helpers
// }))

// app.set('view engine', 'hbs')

// set up HTTP headers for web app security
app.use(helmet())
// app.use(helmet({
//     directives: {
//         "img-src": ['self', 'https://source.unsplash.com/']
//     }
// }))
// app.use(helmet({
//     contentSecurityPolicy: {
//         directives: {
//             ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//             // "img-src": ["'self'", "data:", "https://source.unsplash.com/", "https://images.unsplash.com/"], 
//             // "script-src": ["'self'", "data:", "'unsafe-inline'"]
//         }
//     }
// }))

// set up session to keep track of user data in between requests
app.use(cookieParser())
app.use(session({
    secret: "INFO30005 Web-App",
    resave: false,
    saveUninitialized: false,
    cookie: {
        // user should log in again after restarting the browser
        expires: false, 
        // 2 hours before cookies expire and have to log in again
        maxAge: 2 * 60 * 60 * 1000
    }
}))

// set up database
const db = require('./models/db.js')

// use flash to store messages
app.use(flash())

// configure the passport to handle authentication
app.use(passport.initialize())
app.use(passport.session())

// set up the passport strategies
require('./config/passport').configPassport(passport)

// for reading body of requests
app.use(express.json())

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
app.listen(port, () => {
    console.log('The web app is listening on port', port)
})
