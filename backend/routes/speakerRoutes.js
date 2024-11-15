const express = require("express");
const {z, array} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakerModel = require("../Schemas/Speaker");
const { JWT_SECRET_SPEAKER } = require("../config");
const speakerMiddleware = require("../middlewares/speakerMiddleware");
const sessionModel = require("../Schemas/Session");
const speakerRouter = express.Router();

speakerRouter.post("/signup", async(req,res) => {
    try{
    const requiredBody = z.object({
        name: z.string().min(3, {message: "Name must contain atleast 3 characters"}).max(50, {message: "Name can contain a maximum of 50 characters only"}),
        email: z.string().min(6, {message: "Email must contain atleast 6 characters"}).max(50, {message:"Email can contain only a maximum of 6 characters"}).email({message:"You have not entered a legit email id"}),
        password: z.string().min(6, {message: "Password must be atleast 6 characters long"}).max(50, {message:"Password can have a maximum of 50 characters"}).regex(/[A-Z]/, {message: "Password must contain atleast one upperCase letter"}).regex(/[!@$%&*?]/, {message: "Password must contain atleast one special character"})
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

    await speakerModel.create({
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

speakerRouter.post("/signin", async(req,res) => {
    try{
    const { email, password } = req.body;

    const user = await speakerModel.findOne({
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
        },JWT_SECRET_SPEAKER);

        res.json({
            message: "Signed in successfully",
            token
        });
    }

    res.json({
        message: "Incorrect credentials"
    });
}catch(e){
    res.json({
        message: (e)
    });
}
});

speakerRouter.get("/profile", speakerMiddleware, async(req,res) => {
    const id = req.userId;

    const user = await speakerModel.findById({
        _id: id
    });

    if(!user){
        res.json({
            message: "User information not found"
        });
        return
    }

    res.json({
        user
    });

});

speakerRouter.put("/profile", speakerMiddleware, async(req,res) => {
    const id = req.userId;

    const { name, bio, topics } = req.body;
    try{
    const speaker = await speakerModel.findByIdAndUpdate(id,{
        name,
        bio,
        topics
    });

    if(!speaker){
        res.json({
            message: "User not found"
        });
    }

    res.json({
        message: "Profile updated successfully"
    });
}catch(e){
    res.json({
        message: (e)
    });
}
});

speakerRouter.get("/sessions",speakerMiddleware, async(req,res) => {
    const id = req.userId;

    try{
    const session = await speakerModel.findById(id);

    if(!session){
        res.json({
            message: "No information found for the user"
        });
        return
    }

    res.json({
        sessions: session.sessions
    });
}catch(e){
    res.json({
        message: (e)
    });
}
});

speakerRouter.get("/sessions/:sessionId", speakerMiddleware, async(req,res) => {
    const sessionId = req.params.sessionId;

    try{
    const session = await sessionModel.findById(sessionId);

    if(!session){
        res.json({
            message: "Session not found"
        });
    }else{
        res.json({
            session
        });
    }
}catch(e){
    res.json({
        message: (e)
    });
}
});

// speakerRouter.post("/sessions/:sessionId/poll", speakerMiddleware, async(req,res) => {
//     const id = req.userId;
//     const sessionId = req.params.sessionId;
//     const {question, options} = req.body;

//     const pollResponse = await sessionModel.findByIdAndUpdate(sessionId, {
//         $set: {"pollQuestions.$[elem].question": question},
//         $set: {"pollQuestions.$[elem].options": options}
//     },
// {
//     new: true
// });
//     if(pollResponse){
//         res.json({
//             message: "Your poll has been posted successfully",
//             pollQuestions: pollResponse.pollQuestions
//         });
//     }

//     res.json({
//         message: "There was an error whule uploading your poll"
//     });
// });

speakerRouter.post("/sessions/:sessionId/poll", speakerMiddleware, async(req,res) => {
    const sessionId = req.params.sessionId;
    const { question, options} = req.body;

    if(!question || !Array.isArray(options) || options.length < 1){
       return res.status(400).json({
            message: "Poll must have a question and at least two options"
        });
    }

    const responses = new Map();
    options.forEach(option => {
        responses.set(option, 0);
    });

    const newPoll = {
        question,
        options,
        responses
    }

    const pollResponse = await sessionModel.findByIdAndUpdate(sessionId, {
       $push:{pollQuestions: [newPoll]}
    },{
        new: true
    });

    if(pollResponse){
        res.json({
            message: "Poll has been posted successfully",
            pollQuestions: pollResponse.pollQuestions
        });
    }else{
    res.status(404).json({
        message: "Error while posting the poll"
    });
}
});

// GET /api/speakers/analytics/:sessionId

speakerRouter.get("/analytics", speakerMiddleware, async(req,res) => {
    const id = req.userId;

    try{
    const analytics = await speakerModel.findById(id);

    if(analytics){
        res.json({
            analytics: analytics.analytics
        });
    }else{
        res.json({
            message: "No information about the user was found"
        });
    }
}catch(e){
    res.json({
        message: (e)
    });
}
});

module.exports = speakerRouter;