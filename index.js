const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const mongoose = require('mongoose')
const path = require('path')
const csurf = require('csurf')
const helmet = require('helmet')
const compression = require('compression')
const MongoStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const homeRoutes = require('./routes/home')
const cartRoutes = require('./routes/cart')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const ordersRoutes = require('./routes/orders')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')
const varMiddleware = require('./middleware/variables')
const userMiddleware = require('./middleware/user')
const notFoundMiddleware = require('./middleware/notFound')
const fileMiddleware = require('./middleware/file')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers'),
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})
const store = new MongoStore({
    collection: 'sessions',
    uri: process.env.MONGO_URI
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}))
app.use(fileMiddleware.single('avatar'))
app.use(csurf())
app.use(flash())
app.use(helmet())
app.use(compression())
app.use(varMiddleware)
app.use(userMiddleware)

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/cart', cartRoutes)
app.use('/courses', coursesRoutes)
app.use('/orders', ordersRoutes)
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(notFoundMiddleware)

async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URI)

        app.listen(PORT, () => {
            console.log(`Server started on port: ${PORT}`)
        })
    } catch (error) {
        console.log('Server startup error: ', error)
    }
}

start()
