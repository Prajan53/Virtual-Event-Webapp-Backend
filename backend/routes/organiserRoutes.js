const express = require("express");
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const organiserModel = require("../Schemas/Organiser");
const dayjs = require("dayjs");
const { JWT_SECRET_ORGANISER } = require("../config");
const organiserMiddleware = require("../middlewares/organiserMiddleware");
const eventModel = require("../Schemas/Event");
const sessionModel = require("../Schemas/Session");
const speakerModel = require("../Schemas/Speaker");
const attendeeModel = require("../Schemas/Attendee");
const organiserRouter = express.Router();

organiserRouter.post("/signup", async(req,res) => {
    try{
    const requiredBody = z.object({
        name: z.string().min(3, {message: "Name must contain at least 3 characters"}).max(50, {message: "Name can have of 50 charaters only"}),
        email: z.string().min(6, {message: "Email must contain at least 6 characters"}).max(50, {messsage: "Email can have a maximum of 50 characters only"}).email(),
        password: z.string().min(6, {message: "Password must contain at least 6 characters"}).max(50, {message: "Password can have a maximum of 50 characters only"}).regex(/[A-Z]/, {message: "Password must contain at least one upper case letter"}).regex(/[!@$%&*?]/, {message: "Password must contain at least one special character"})
    });

    const parsedBody = requiredBody.safeParse(req.body);

    if(!parsedBody.success){
        res.json({
            message: (parsedBody.error.errors)
        });
        return
    }

    const {name, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password,10);

    await organiserModel.create({
        name, 
        email,
        password: hashedPassword
    });

    res.json({
        message: "You are signed up successfully"
    });
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.post("/signin", async(req,res) => {
    const {email, password} = req.body;

    try{
    const user = await organiserModel.findOne({
        email
    });

    if(!user){
        res.json({
            message: "User does not exist"
        });
        return
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if(passwordMatch){
        const token = jwt.sign({
            id: user._id
        },JWT_SECRET_ORGANISER);

        res.json({
            message: "Signed in successfuly",
            token
        });

    }else{
        res.json({
            message: "Incorrect credentials"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.get("/profile",organiserMiddleware, async(req,res) => {
    const id = req.userId;
    
    try{
    const profile = await organiserModel.findById(id);

    if(profile){
        res.json({
            profile
        });
    }else{
        res.json({
            message: "No information about the user is found"
        });
    }}catch(e){
        res.json({
            message: (e.message)
        });
    }
});

organiserRouter.put("/profile", organiserMiddleware, async(req,res) => {
    const id = req.userId;
    try{
    const {name, organisation } = req.body;

    const profileUpdate = await organiserModel.findByIdAndUpdate(id,{
        name,
        organisation
    });

    if(profileUpdate){
        res.json({
            message: "Profile updated successfully",
            profileUpdate
        });
    }else{
        res.json({
            message: "No information about the user is found"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.post("/events", organiserMiddleware, async (req,res) => {
    const id = req.userId;

    try{
    const {name, description, date } = req.body;

    const parsedDate = dayjs(date, "DD/MMMM/YYYY", true).toDate();

    if(isNaN(parsedDate)){
        return res.json({
            message: "Invalid date format. please use DD/MMMM/YYYY format."
        });
    }

   const organiserEventCreation = await eventModel.create({
        name,
        description,
        date: parsedDate,
        organiser: id
    });

    if(organiserEventCreation){
        res.json({
            message: `${name} event has been created successfully`,
            organiserEventCreation,
            date: dayjs(organiserEventCreation.date).format("MMMM D, YYYY")
        });
    }else{
        res.json({
            message: "There was an error creating the event"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.get("/events", organiserMiddleware, async (req,res) => {
    try{
    const events = await eventModel.find({});

    if(events.length > 0){
        const eventDetails = events.map(event => ({
            name: event.name,
            description: event.description,
            date: dayjs(event.date).format("MMM D, YYYY")
        }));

        res.json({
            events: eventDetails
        });
    }else{
        res.json({
            message: "No information about the events is found"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.get("/events/:eventId", organiserMiddleware, async (req,res) => {
    try{
    const eventId = req.params.eventId;

    const eventInformation = await eventModel.findById(eventId);

    if(eventInformation){
        res.json({
            eventName: eventInformation.name,
            eventDescription: eventInformation.description,
            eventDate: dayjs(eventInformation.date).format("MMM D,YYYY")
        });
    }else{
        res.json({
            message: "No information of the event was found"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.put("/events/:eventId", organiserMiddleware, async (req,res) => {
    try{
    const eventId = req.params.eventId;
    const id = req.userId;
    let canEditEvents;
    const {name, description, date} = req.body;

    const organiserInformation = await organiserModel.findById(id);

    if(!organiserInformation){
        res.json({
            message: "No information about the organiser was found"
        });
    }

    canEditEvents = organiserInformation.permissions.canEditEvents;

    if(canEditEvents){
        const eventUpdation = await eventModel.findByIdAndUpdate(eventId, {
            name,
            description,
            date
        });

        res.json({
            message: "The event information has been updated successfully"
        });
    }else{
        res.json({
            message: "You do not have the access to edit events"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.delete("/events/:eventId", organiserMiddleware, async (req,res) => {
    try{
    const eventId = req.params.eventId;
    const id = req.userId;

    const accessInformation = await organiserModel.findById(id);

    if(!accessInformation){
        res.json({
            message: "No information about the user was found"
        });
    }

    canEditEvents = accessInformation.permissions.canEditEvents;

    if(canEditEvents){
        const deletedList = await eventModel.findByIdAndDelete(eventId);

        if(deletedList){
            res.json({
                message: "The event has been deleted successfully"
            });
        }else{
            res.json({
                message: "Error while deleting the event"
            });
        }
    }else{
        res.json({
            message: "You do not have the access to delete the event"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.post("/events/:eventId/sessions", organiserMiddleware, async (req,res) => {
    try{
    const eventId = req.params.eventId;
    const id = req.userId;
    const { title, description, date } = req.body;

    const eventDetails = await eventModel.findById(eventId);

    if(!eventDetails){
       return res.json({
            message: "The event does not exist"
        });
    }

    const parsedDate = dayjs(date, "DD/MMMM/YYYY", true).toDate();

    const sessionCreation = await sessionModel.create({
        title,
        description,
        date: parsedDate,
        event: eventId
    });

    if(sessionCreation){
        res.json({
            message: "The session for the event was created successfully"
        });
    }else{
        res.json({
            message: "There was an error while creating the session"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.put("/events/:eventId/sessions/:sessionId", organiserMiddleware, async (req,res) => {
    try{
    const sessionId = req.params.sessionId;
    const id = req.userId;

    const { title, description, date } = req.body;

    const parsedDate = dayjs(date, "DD/MMMM/YYYY", true).toDate();

    const sessionUpdation = await sessionModel.findByIdAndUpdate(sessionId, {
        title, 
        description,
        date: parsedDate
    });

    if(sessionUpdation){
        res.json({
            message: "The session has been updated successfully"
        });
    }else{
        res.json({
            message: "There was an error while updating the session"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.delete("/events/:eventId/sessions/:sessionId", organiserMiddleware, async (req,res) => {
    try{
    const sessionId = req.params.sessionId;

    const deleteEvent = await sessionModel.findByIdAndDelete(sessionId);

    if(deleteEvent){
        res.json({
            message: "The session has been deleted successfully"
        });
    }else{
        res.json({
            message: "The session that you are trying to delete does not exist"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.get("/events/:eventId/sessions", organiserMiddleware, async (req,res) => {
    try{
    const eventId = req.params.eventId;
    const sessions = await sessionModel.find({
        event: eventId
    });

    if(sessions.length > 0){
        const sessionDetails = sessions.map(session => ({
            title: session.title,
            description: session.description,
            date: dayjs(session.date).format("MMM D, YYYY")
        }));

   return res.json({
        sessions: sessionDetails
    });
}else{
   return res.json({
        message: "No information about the sessions is found"
    });
}
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.post("/speakers/assign", organiserMiddleware, async (req,res) => {
    try{
    const { speakerId, sessionId } = req.body;

    const speaker = await speakerModel.findById(speakerId);
    if(!speakerId){
       return res.json({
            message: "The speaker is not registered yet"
        });
    }

    if (speaker.sessions.includes(sessionId)) {
        return res.json({
            message: "The speaker is already assigned to this session."
        });
    }

    const session = await sessionModel.findByIdAndUpdate(sessionId,{
        speaker: speakerId
    });
    if(session){
        res.json({
            message: "The speaker has been assigned to the event"
        });
        await speakerModel.findByIdAndUpdate(speakerId, {
            $push: {sessions: session._id},
            $inc: {"analytics.sessionsPresented": 1}
        },{
            new: true
        });
    }else{
       return res.json({
            message: "The session does not exist"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

organiserRouter.get("/speakers", organiserMiddleware, async (req,res) => {
    try{
    const speakers = await speakerModel.find({});

    if(speakers.length > 0){
        const speakerDetails = speakers.map(speaker => ({
            name: speaker.name
        }));

    res.json({
        speakers: speakerDetails
    });
    }else{
        res.json({
            message: "No speaker has registered"
        });
    }
    }catch(e){
        res.json({
            message: (e.message)
        });
    }
});

organiserRouter.get("/speakers/:speakerId", organiserMiddleware, async (req,res) => {
    try{
    const speakerId = req.params.speakerId;

    const speakerDetails = await speakerModel.findById(speakerId);
    if(speakerDetails){
        res.json({
            name: speakerDetails.name,
            bio: speakerDetails.bio,
            topics: speakerDetails.topics,
            sessions: speakerDetails.sessions,
            analytics: speakerDetails.analytics
        });
    }else{
        res.json({
            message: "The speaker does not exist"
        });
    }
    }catch(e){
        res.json({
            message: (e.message)
        });
    }
});

organiserRouter.get("/events/:eventId/attendees", organiserMiddleware, async (req,res) => {
    try{
    const eventId = req.params.eventId;

    const eventInformation = await eventModel.findById(eventId);
    if(eventInformation){
        res.json({
            attendees: eventInformation.attendees
        });
    }else{
        res.json({
            message: "The event does not exist"
        });
    }
    }catch(e){
        res.json({
            message: (e.message)
        })
    }
});

organiserRouter.post("/events/:eventId/notify", organiserMiddleware, async (req,res) => {
    try{
    const eventId = req.params.eventId;
    const { notification } = req.body;
    let attendees;

    const notificationEvent = await eventModel.findByIdAndUpdate(eventId, {
        $push: {notifications: notification}
    });
    if(notificationEvent){
        attendees = notificationEvent.attendees;
        const notificationAttendee = await attendeeModel.updateMany(
            {_id: { $in: attendees }},
            {$push: {notifications: {message: notification, date: new Date() } } }
        )
        if(notificationAttendee){
            res.json({
                message: "Notification is added"
            });
        }
    }else{
        res.json({
            message: "The event does not exist"
        });
    }
    }catch(e){
        res.json({
            message: (e.message)
        });
    }

});

module.exports = organiserRouter;