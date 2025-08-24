const Lead = require('../models/lead.model');

exports.getAllLeads = async (req, res) => {
    try {
        let { page = 1, limit = 20 } = req.query;
        page = parseInt(page) || 1;
        limit = Math.min(parseInt(limit) || 20, 100);

        const query = {};
        const opMap = {
            equals: v => v,
            contains: v => ({ $regex: v, $options: 'i' }),
            in: v => ({ $in: Array.isArray(v) ? v : v.split(',') }),
            gt: v => ({ $gt: Number(v) }),
            lt: v => ({ $lt: Number(v) }),
            between: v => ({ $gte: Number(v[0]), $lte: Number(v[1]) }),
            on: v => {
                const date = new Date(v);
                const start = new Date(date.setHours(0,0,0,0));
                const end = new Date(date.setHours(23,59,59,999));
                return { $gte: start, $lte: end };
            },
            before: v => ({ $lt: new Date(v) }),
            after: v => ({ $gt: new Date(v) })
        };

        if (req.query.filters) {
            let filters;
            try {
                filters = JSON.parse(req.query.filters);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid filters JSON' });
            }
            for (const [field, ops] of Object.entries(filters)) {
                for (const [op, value] of Object.entries(ops)) {
                    if (value === '' || value === undefined || value === null || (Array.isArray(value) && value.length === 0)) continue;
                    if (field === 'is_qualified' && op === 'equals') {
                        query[field] = value === true || value === 'true';
                    } else if (op === 'between') {
                        if (field === 'score' || field === 'lead_value') {
                            const min = Number(ops.between_min);
                            const max = Number(ops.between_max);
                            if (!isNaN(min) && !isNaN(max)) {
                                query[field] = { $gte: min, $lte: max };
                            }
                        } else if (field === 'created_at' || field === 'last_activity_at') {
                            const start = ops.between_start;
                            const end = ops.between_end;
                            if (start && end) {
                                query[field] = { $gte: new Date(start), $lte: new Date(end) };
                            }
                        }
                    } else if (op === 'on' && (field === 'created_at' || field === 'last_activity_at')) {
                        const date = new Date(value);
                        const start = new Date(date.setHours(0,0,0,0));
                        const end = new Date(date.setHours(23,59,59,999));
                        query[field] = { $gte: start, $lte: end };
                    } else if ((op === 'before' || op === 'after') && (field === 'created_at' || field === 'last_activity_at')) {
                        query[field] = opMap[op](value);
                    } else if (op === 'in') {
                        query[field] = opMap[op](value);
                    } else if (op === 'contains' || op === 'equals' || op === 'gt' || op === 'lt') {
                        if (!query[field]) query[field] = {};
                        if (op === 'equals') {
                            if (field === 'score' || field === 'lead_value') {
                                query[field] = Number(value);
                            } else {
                                query[field] = value;
                            }
                        } else if (op === 'contains') {
                            query[field] = { $regex: value, $options: 'i' };
                        } else if (op === 'gt' || op === 'lt') {
                            if (typeof query[field] !== 'object' || Array.isArray(query[field])) query[field] = {};
                            query[field][`$${op}`] = Number(value);
                        }
                    }
                }
            }
        }

        const data = await Lead.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const total = await Lead.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            data,
            page,
            limit,
            total,
            totalPages
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

// Fetch a single lead by ID
exports.getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
