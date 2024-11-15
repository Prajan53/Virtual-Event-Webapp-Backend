const express = require("express");
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const attendeeModel = require("../Schemas/Attendee");
const { JWT_SECRET_ATTENDEE } = require("../config");
const attendeeMiddleware = require("../middlewares/attendeeMiddleware");
const eventModel = require("../Schemas/Event");
const attendeeRouter = express.Router();

attendeeRouter.post("/signup", async(req,res) => {
    try{
    const requiredBody = z.object({
        name: z.string().min(3, {message:"Name must contain atleast three characters"}).max(50, {message:"Name can have only fifty characters"}),
        email: z.string().min(6, {message:"Email must be atleast 6 characters long"}).max(50, {message:"Email can have a maximum of 50 characters only"}).email(),
        password: z.string().min(6, {message: "Password must contain atleast 6 characters"}).max(50, {message: "Password can only be 50 characters long"}).regex(/[A-Z]/, {message: "Password must contain atleast one uppercase letter"}).regex(/[!@$%&*?]/, {message: "Password must contain atleast one special character"})
    });

    const parsedBody = requiredBody.safeParse(req.body);

    if(!parsedBody.success){
        res.json({
            message: (parsedBody.error.errors)
        });
        return
    }

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await attendeeModel.create({
        name,
        email,
        password: hashedPassword
    });

    res.json({
        message: "Signed up successfully"
    });
}catch(e){
    res.json({
        message: (e)
    });
}
});

attendeeRouter.post("/signin", async(req,res) => {
    try{
    const { email, password } = req.body;

    const user = await attendeeModel.findOne({
        email
    });

    if(!user){
        res.json({
            message: "User does not exist"
        });
        return
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if(passwordMatch){
        const token = jwt.sign({
            id: user._id
        }, JWT_SECRET_ATTENDEE);

        res.json({
            message: "Signed in successfully",
            token
        });
    }else{
        res.json({
            message: "Incorrect credentials"
        });
    }
}catch(e){
    res.json({
        message: (e)
    });
}
});

attendeeRouter.get("/profile",attendeeMiddleware, async(req,res) => {

    const id = req.userId;
    const user = await attendeeModel.find({
        _id: id
    });

    res.json({
        user
    });
});

attendeeRouter.put("/profile",attendeeMiddleware, async(req,res) => {
    const {name, interests, skills } = req.body;
    const id = req.userId;

    try{
    const attendee = await attendeeModel.findByIdAndUpdate(id,{
        name,
        interests,
        skills
    });

    if(!attendee){
        res.json({
            message: "User not found"
        });
        return
    }

    res.json({
        message: "Profile updated successfully"
    });
}catch(e){
    res.json({
        message: (e)
    })
}

});

attendeeRouter.get("/events", async(req,res) => {
    const events = await eventModel.find({});

    res.json({
        events
    });
});

attendeeRouter.get("/events/:eventId", async(req,res) => {
    const eventId = req.params.eventId;

    const event = await eventModel.findById({
        _id: eventId
    });

    if(!event){
        res.json({
            message: "Event is not available"
        });
        return
    }else{
        res.json({
        event
    });
}
});

attendeeRouter.post("/events/:eventId/register",attendeeMiddleware, async(req,res) => {
    const eventId = req.params.eventId;
    const id = req.userId;

    const event = await eventModel.findById({
        _id: eventId
    });

    if(!event){
        res.json({
            message: "The event does not exist"
        });
        return
    }

   const registration =  await attendeeModel.findByIdAndUpdate(id,{
        eventsRegistered: eventId
    });

    if(!registration){
        res.json({
            message: "Error while registering for the event"
        });
        return
    }
    const eventModelUpdation = await eventModel.findByIdAndUpdate(eventId,{
        attendees: registration._id
    });
    if(eventModelUpdation){
    res.json({
        message: "Registered for the event successfully"
    });
}else{
    res.json({
        message: "Error while registering for the event"
    });
}
});

attendeeRouter.get("/event/registered",attendeeMiddleware, async(req,res) => {
    const id = req.userId;

    const user = await attendeeModel.findById({
        _id: id
    });

    if(!user){
        res.json({
            message: "No information about the user is found"
        });
        return
    }

    const eventsRegistered = user.eventsRegistered

    res.json({
        eventsRegistered
    });
});

attendeeRouter.get("/notifications", attendeeMiddleware, async(req,res) => {
    const id = req.userId;

    const user = await attendeeModel.findById({
        _id: id
    });

    if(!user){
        res.json({
            message: "User does not exist"
        });
        return
    }

    notifications = user.notifications;
    res.json({
        notifications
    });
});

attendeeRouter.put("/notifications/read", attendeeMiddleware, async (req, res) => {
    try {
      const id = req.userId;
  
      const user = await attendeeModel.findById(id);
  
      if (!user) {
        return res.json({
          message: "User not found",
        });
      }
  
      const updatedUser = await attendeeModel.findByIdAndUpdate(
        id,
        {
          $set: { "notifications.$[elem].read": true }
        },
        {
          arrayFilters: [{ "elem.read": false }], // Only update unread notifications
          new: true // Return the updated document
        }
      );
  
      if (updatedUser) {
        res.json({
          message: "Notifications marked as read",
          notifications: updatedUser.notifications
        });
      } else {
        res.json({
          message: "No new notifications",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  


module.exports = attendeeRouter;