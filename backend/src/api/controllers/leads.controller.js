const Lead = require('../models/lead.model');

// Get all leads with filtering, sorting, and pagination
exports.getAllLeads = async (req, res) => {
    try {
        const { status, source, company, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) query.status = status;
        if (source) query.source = source;
        if (company) query.company = { $regex: company, $options: 'i' };

        const leads = await Lead.find(query)
            .sort({ createdAt: -1 }) // Sort by most recent
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Lead.countDocuments(query);

        res.status(200).json({
            leads,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalLeads: count,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Create a new lead
exports.createLead = async (req, res) => {
    try {
        const {first_name, last_name, email, phone, company, city, state, source, status,score,lead_value} = req.body;
        if (!first_name||!last_name||!email||!phone||!company||!city||!state||!source||!status||!score||!lead_value) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const newLead = new Lead(req.body);
        const savedLead = await newLead.save();
        res.status(201).json(savedLead);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Update an existing lead
exports.updateLead = async (req, res) => {
    try {
        const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, // Return the modified document
            runValidators: true // Run schema validators on update
        });
        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json(updatedLead);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Delete a lead
exports.deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
