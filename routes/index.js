const router = require('express').Router()
const apiRoutes = require('./api')

// API Routes any route starting with '/api'
router.use('/api', apiRoutes)

// =========== SEND REACT PRODUCTION BUILD ====================
router.get('*', (req, res) => {
  res.status(404).send("Route not found")
})

module.exports = router
