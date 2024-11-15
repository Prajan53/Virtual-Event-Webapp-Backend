const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const EventSchema = new Schema({
    name: {type:String, required:true},
    description: String,
    date: Date,
    organiser: {type:ObjectId, ref:"Organiser"},
    sessions: [{type:ObjectId, ref:"Session"}],
    attendees: [{type:ObjectId, ref:"Attendee"}],
    sponsors: [{type:ObjectId, ref:"Sponsor"}],
    notifications: [{type:String}]
}, {timestamps:true});

const eventModel = mongoose.model("Event", EventSchema);

module.exports = eventModel;
