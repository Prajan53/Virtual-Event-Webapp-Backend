const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const SponsorSchema = new Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    role: {type:String, default:'sponsor'},
    company: {type:String, required:true},
    boothResources: [
        {
            title:{type:String, required:true},
            url:{type:String, required: true},
            type:{type:String, required: true}
        },
    ],
    eventsSponsored: [{type:ObjectId, ref:'Event'}],
    analytics: {
        boothVisits: {type:Number, default:0},
        resourceDownloads: {type:Number, default:0},
    },
},{timestamps:true});

const sponsorModel = mongoose.model("Sponsor",SponsorSchema);

module.exports = sponsorModel;