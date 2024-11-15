const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_SPEAKER } = require("../config");

function speakerMiddleware(req,res,next){
    try{
    const token = req.headers.token;

    const decoded = jwt.verify(token, JWT_SECRET_SPEAKER);

    if(decoded){
        req.userId = decoded.id;
        next()
    }else{
        res.json({
            message: "You are not signed in"
        });
    }
}catch(e){
    res.json({
        message: (e)
    });
}

}

module.exports = speakerMiddleware;