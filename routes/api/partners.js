const router = require('express').Router()
const partnerController = require('../../controllers/partnerController')

// Matches with "/api/user"
router
    .route('/')
    // GET "/api/user"
    .get(partnerController.getAllPartners) // Gets all the users
    // POST "/api/user" Example Request: { "vals": ["test_user", "111111", 1] }
    .post(partnerController.createNewPartner) // create a new user
//= ======================================================

// Matches with "/api/user/:id"
router
    .route('/:id')
    // GET "/api/user/:id"
    .get(partnerController.getPartnerById) // get user data by ID
    // PUT "/api/user/:id" Example Request: { "vals": ["test_user", "111111", 1] }
    .put(partnerController.updatePartnerById) // update a user by ID
    // DELETE "/api/user/:id"
    .delete(partnerController.deletePartnerById) // delete a user by ID

module.exports = router
