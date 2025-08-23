const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');

router.route('/')
    .get(leadsController.getAllLeads)
    .post(leadsController.createLead);

router.route('/:id')
    .put(leadsController.updateLead)
    .delete(leadsController.deleteLead);

module.exports = router;