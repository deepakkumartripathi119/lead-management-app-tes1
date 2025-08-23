const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
// In a real app, you would add auth middleware here
// const { protect } = require('../middleware/auth.middleware');

// Apply middleware to all routes in this file
// router.use(protect);

router.route('/')
    .get(leadsController.getAllLeads)
    .post(leadsController.createLead);

router.route('/:id')
    .put(leadsController.updateLead)
    .delete(leadsController.deleteLead);

module.exports = router;