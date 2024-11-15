const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const SpeakerSchema = new Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    role: {type:String, default:'speaker'},
    bio: String,
    topics: [String],
    sessions: [{type: ObjectId, ref:'Session'}],
    analytics: {
        sessionsPresented: {type: Number, default:0},
        attendeeEngagement: {type: Number, default:0}
    },
},{timestamps: true});

const speakerModel = mongoose.model("Speaker",SpeakerSchema);

module.exports = speakerModel;