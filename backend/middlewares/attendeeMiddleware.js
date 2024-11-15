const jwt = require("jsonwebtoken");
const { JWT_SECRET_ATTENDEE } = require("../config");

function attendeeMiddleware(req,res,next){
    const token = req.headers.token;

    const decoded = jwt.verify(token, JWT_SECRET_ATTENDEE)

    try{
    if(decoded){
        req.userId = decoded.id;
        next()
    }else{
        res.status(403).json({
            message: "You are not signed in"
        })
    }
}catch(e){
    res.json({
        message: (e)
    });
}
}

module.exports = attendeeMiddleware;