const router = require('express').Router()
const usersRoute = require('./users')
const loginRoute = require('./login')
const logoutRoute = require('./logout')
const productsRoute = require('./products')
const categoriesRoute = require('./categories')

// login route for Users
router.use('/login', loginRoute)

// logout route for Users
router.use('/logout', logoutRoute)

// '/api/user' for all routes involving User Accounts
router.use('/users', usersRoute)

router.use('/products', productsRoute)

router.use('/categories', categoriesRoute)

// '/api' for any ongoing testing the root of /api route GOOD place for mounting middleware in router.use
router.get('/', (req, res) => {
  res.status(200).send('Succesful get to /api route')
})

module.exports = router
