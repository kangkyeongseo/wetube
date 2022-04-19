import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { is } from "express/lib/request";

export const getJoin = (req, res) => {
    return res.render("join", {pageTitle: "Join"});
}
export const postJoin = async(req, res) => {
    const {name, email, username, password, password2, location} = req.body;
    const pageTitle = "Join";
    if(password !== password2) {
        return res.status(400).render("join", {pageTitle, errorMessage: "Password confirmatiom does not match"});
    };
    const exists = await User.exists({$or: [{username},{email}]});
    if(exists) {
        return res.status(400).render("join", {pageTitle, errorMessage: "This username/email is already taken"});
    };
    try {
        await User.create({
            name,
            email,
            username,
            password,
            location,
        });
        return res.redirect("/login");
    }catch(error) {
        return res.status(400).render("join", {pageTitle, errorMessage: error._message});
    };
};
export const getLogin = (req, res) => res.render("login", {pageTitle:"Login"});
export const postLogin = async(req, res) => {
    const {username, password} = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({username});
    if(!user) {
        return res.status(400).render("login", {pageTitle, errorMessage: "An account with this username does not exists."});
    }
    const ok =await bcrypt.compare(password, user.password);    
    if(!ok) {
        return res.status(400).render("login", {pageTitle, errorMessage: "Wrong password"});
    } 
    req.session.loggedIn = true;
    req.session.user = user;
     return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
    const baseUrl = `https://github.com/login/oauth/authorize`;
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params =  new URLSearchParams(config).toString();
    const finalUrl= `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async(req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params =  new URLSearchParams(config).toString();
    const finalUrl= `${baseUrl}?${params}`;
    const tokenRequest = await (await fetch(finalUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    })).json();
    if("access_token" in tokenRequest) {
        const {access_token} = tokenRequest;
        const apiUrl ="https://api.github.com";
        const userData =  await (await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json();
        console.log(userData);
        const emailData =  await (await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified ===true 
        );
        if(!emailObj) {
            return res.redirect("/login");    
        }
        const existingUser = await User.findOne({email: emailObj.email});
        if(existingUser) {
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/");
        }else {
            const user = await User.create({
                name: userData.name,
                email:emailObj.email,
                username:userData.login,
                password:"",
                socialOnly: true,
                location:userData.location,
            });
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
        }
    }else {
        return res.redirect("/login");
    };
}

export const edit = (req, res) => res.send("Edit User"); 
export const remove = (req, res) => res.send("Remove User")
export const logout = (req, res) => res.send("Log Out")
export const see = (req, res) => res.send("See User")


