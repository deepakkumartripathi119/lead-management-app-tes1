const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String,required: true,  trim: true },
    company: { type: String,required: true,  trim: true },
    city: { type: String,required: true,  trim: true },
    state: { type: String,required: true,  trim: true },
    source: { type: String,required: true,  required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['new', 'contacted', 'qualified', 'lost', 'won'],
    default: 'new' 
    },
    score: { type: Number,required: true,  default: 0, min: 0, max: 100 },
    lead_value: { type: Number,required: true,  default: 0, min: 0 },
    is_qualified: { type: Boolean, default: false },
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Lead', leadSchema);
