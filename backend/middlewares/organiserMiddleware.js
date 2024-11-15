const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_ORGANISER } = require("../config");

function organiserMiddleware(req,res,next){
    const token = req.headers.token;
    try{
    const decoded = jwt.verify(token, JWT_SECRET_ORGANISER);

    if(decoded){
        req.userId = decoded.id,
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

module.exports = organiserMiddleware;