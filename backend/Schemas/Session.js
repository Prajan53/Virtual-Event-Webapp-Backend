const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const SessionSchema = new Schema({
    title: {type:String, required:true},
    description: String,
    date: Date,
    speaker: {type:ObjectId, ref:"Speaker"},
    event: {type:ObjectId, ref:"Event"},
    participants: [{type:ObjectId, ref:"Attendee"}],
    pollQuestions: [
        {
            question: String,
            options: [String],
            responses: {type:Map, of:Number}//Key value pairs of options and responses
        },
    ],
}, {timestamps:true});

const sessionModel = mongoose.model("Sessions", SessionSchema);

module.exports = sessionModel;