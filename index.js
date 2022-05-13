const express = require('express')
const app = express();
const morgan = require('morgan')
const mongoose = require('mongoose')
const multer = require('multer')
const cors = require('cors') // cross origin resource sharing to received data from the frontend
// cors most be called before anything in the application
app.use(cors());

// This will allow http request
app.options('*', cors())

// The .env file is for storing public information, this will make the information in the .env file available
require('dotenv/config')

const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/errorHandler');

const api = process.env.API_URL

//middle ware
// This will make the backend convert the data received from the frontend as json
app.use(express.json())
app.use(morgan('tiny')) // To see the restful api request made
app.use(authJwt());
app.use(errorHandler);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))


// importing the router
const categoriesRouter = require('./routers/categories')
const productsRouter = require('./routers/products')
const ordersRouter = require('./routers/orders')
const usersRouter = require('./routers/users')


// Routers
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/products`, productsRouter)
app.use(`${api}/orders`, ordersRouter)
app.use(`${api}/users`, usersRouter)

// connecting to mongodb cloud server
mongoose.connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log('Database connected successfully')
}).catch((err) => {
    console.log(err)
})

app.listen(5000, () => {
    console.log('server running at http://localhost:5000')
})

console.log(api)
