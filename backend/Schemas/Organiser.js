const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const OrganiserSchema = new Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    role: {type:String, default:'organiser'},
    organisation: String,
    eventsManaged: [{type:ObjectId, ref:'Event'}],
    permissions: {
        canEditEvents: {type:Boolean, default:true},
        canManageContent: {type:Boolean, default:true},
    },
    analyticsAccess: {type:Boolean, default:true},
},{timestamps:true});

const organiserModel = mongoose.model("Organiser",OrganiserSchema);

module.exports = organiserModel;
