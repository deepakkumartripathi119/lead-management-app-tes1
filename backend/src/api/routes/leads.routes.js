const express = require('express');
const router = express.Router();
const leadsCtrl = require('../controllers/leads.controller');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.route('/')
    .get(leadsCtrl.getAllLeads)
    .post(leadsCtrl.createLead);

router.route('/:id')
    .get(leadsCtrl.getLeadById)
    .put(leadsCtrl.updateLead)
    .delete(leadsCtrl.deleteLead);

module.exports = router;