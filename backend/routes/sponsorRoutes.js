const express = require("express");
const sponsorRouter = express.Router();
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sponsorMiddleware = require("../middlewares/sponsorMiddlewarre");
const sponsorModel = require("../Schemas/Sponsor");
const { JWT_SECRET_SPONSOR } = require("../config");

sponsorRouter.post("/signup",async (req,res) => {
try{
const requiredBody = z.object({
    name: z.string().min(3, {message: "Name field must contain atleast 3 characters"}).max(50, {message: "Name field can have a maximum of 50 characters only"}),
    email: z.string().min(6, {message: "Email must be atleast 6 characters long"}).max(50, {message: "Email can have a maximum of 50 characters"}).email({message: "The email you've entered is not an email"}),
    password: z.string().min(6, {message: "Password must contain atleast 6 characters"}).max(50, {message: "Password can contain a maximum of 50characters only"}).regex(/[A-Z]/, {message: "Password must contain atleast one upper case character"}).regex(/[!@$%&*?]/, {message: "Paasword must contain atleast one special character"}),
    company: z.string().min(3, {message: "The company field must contain at least three characters"}).max(50, {message: "The company field can contain a maximum of 50 characters only"})
});

const parsedBody = requiredBody.safeParse(req.body);

if(!parsedBody.success){
   return res.json({
        message: (parsedBody.error.errors)
    });
}

const {name, email, password, company} = req.body;

const hashedPassword = await bcrypt.hash(password, 10);

await sponsorModel.create({
    name,
    email,
    password: hashedPassword,
    company
});

return res.json({
    message: "You have signed up successfully"
});
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

sponsorRouter.post("/signin", async (req,res) => {
    try{
    const {email, password} = req.body;

    const user = await sponsorModel.findOne({
        email
    });

    if(!user){
        res.json({
            message: "You have not signed up yet"
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if(passwordMatch){
        const token = jwt.sign({
            id: user._id
        }, JWT_SECRET_SPONSOR);
        res.json({
            message: "You have signedi successfully",
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

sponsorRouter.get("/profile", sponsorMiddleware, async (req,res) => {
    try{
    const sponsorId = req.userId;

    const sponsor = await sponsorModel.findById(sponsorId);

    if(sponsor){
        res.json({
            name: sponsor.name,
            company: sponsor.company,
            eventsSponsored: sponsor.eventsSponsored
        });
    }else{
        res.json({
            message: "The sponsor does not exist"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

sponsorRouter.put("/profile", sponsorMiddleware, async (req,res) => {
    try{
    const sponsorId = req.userId;
    const { name, company } = req.body;

    const sponsorProfileUpdation = await sponsorModel.findByIdAndUpdate(sponsorId, {
        name,
        company
    });
    if(sponsorProfileUpdation){
        res.json({
            message: "Your profile has been updated successfully"
        });
    }else{
        res.json({
            message: "There was an error while updating your profile"
        });
    }
}catch(e){
    res.json({
        message: (e.message)
    });
}
});

sponsorRouter.post("/booth", sponsorMiddleware, async (req, res) => {
    try {
        const sponsorId = req.userId;
        const { title, url, type } = req.body;

        if (!title || !url || !type) {
            return res.status(400).json({ message: "Title, URL, and type are required." });
        }

        const boothUpdate = await sponsorModel.findByIdAndUpdate(
            sponsorId,
            {
                $push: {
                    boothResources: { 
                        title, 
                        url, 
                        type 
                    }
                }
            },
            { new: true }
        );

        if (boothUpdate) {
            res.json({
                message: "Your resources have been created successfully"
            });
        } else {
            res.status(500).json({ message: "Error updating booth resources." });
        }
    } catch (e) {
        console.error("Error details:", e);
        res.status(500).json({ message: e.message });
    }
});

// PUT /api/sponsors/booth/resources/:resourceId

module.exports = sponsorRouter;