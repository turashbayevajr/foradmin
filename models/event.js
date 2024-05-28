const mongoose = require('mongoose');

// Define the schema for the event
const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant'
    }]
});

// Define the model for the event
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
