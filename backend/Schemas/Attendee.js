const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const AttendeeSchema = new Schema({
    name: {type:String, required:true},
    email: {type:String, unique:true, required:true},
    password: {type:String, required:true},
    role: {type:String, default:'attendee'},
    interests: [String],
    skills: [String],
    eventsRegistered: [{type: ObjectId, ref:'Event'}],
    connections: [{type: ObjectId, ref:'Attendee'}],
    notifications: [
        {
            message: String,
            date: {type: Date, default: Date.now},
            read: {type: Boolean, default: false}
        },
    ],
}, {timestamps: true});

const attendeeModel = mongoose.model("Attendee",AttendeeSchema);

module.exports = attendeeModel;