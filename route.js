const express = require("express");
const { signupValidation, loginValidation, parcelValidation, statusValidation } = require('./validation')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const {
    createNewUser,
    checkIfUserDoesNotExistBefore,
    checkIfEmailAndPasswordMatch,
    createNewParcel,
    authorisationById,
    authenticationById,
    changeDestination,
    parcelauthorisation,
    changeStatus,
    checkParcelStatus,
    changeLocation,
    getAllParcels,
    getParcelsByUserId,
    getParcelsByUserAndParcelId,
    authenticationnByToken,
} = require("./vergeService");



router.post(
    "/auth/signup",
    (req, res, next) => {
        //LETS VALIDATE THE DATA
        const { error } = signupValidation(req.body);
        if(error) {
            return res.status(400).json({
                message: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        // const { first_name, last_name, email, password, state} = req.body;
        // if (!first_name || !last_name || !email || !password || !state) {
        //     return res.status(400).json({
        //         message: "Please fill all fields",
        //     });
        // }
        next();
    },
    async (req, res) => {
        const { email } = req.body;
        const type = "user";
        try{
            await checkIfUserDoesNotExistBefore(email);
            const result = await createNewUser(type, req.body);
            return res.status(201).json(result);
        } catch(e) {
            return res.status(e.code).json(e);
        }
    }
);

router.post(
    "/auth/admin/signup",
    (req, res, next) => {
        const { error } = signupValidation(req.body);
        if(error) {
            return res.status(400).json({
                message: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res, next) =>{
        const { auth } = req.headers;
        const token = auth;
        try {
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "superadmin")

        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        const { email } = req.body;
        const type = "admin";
        try{
            await checkIfUserDoesNotExistBefore(email);
            const result = await createNewUser(type, req.body);
            return res.status(201).json(result);
        } catch(e) {
            return res.status(e.code).json(e);
        }
    }
);

router.post(
    "/auth/login",
    (req, res, next) =>{
        const { error } = loginValidation(req.body);
        if(error) {
            return res.status(400).json({
                message: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        try{
            const result = await checkIfEmailAndPasswordMatch(req.body);
            console.log("apple + " + result.data.user.id);
            const token = jwt.sign({_id: result.data.user.id}, process.env.TOKEN_SECRET);

            res.header('auth', token).json({...result, data: {token, ...result.data}});

            // return res.status(200).json(result);
        } catch (e) {
            console.log(e)
            return res.status(e.code).json(e);
        }
    }
)

router.post(
    "/parcel",
    (req, res, next) =>{
        const { error } = parcelValidation(req.body);
        if(error) {
            return res.status(400).json({
                message: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res, next) =>{
        const { auth } = req.headers;
        const token = auth;
        try {
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "user")

        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        try {
            const user_id = req.user._id;
            const result = await createNewParcel(user_id, req.body);
            return res.status(201).json(result);
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
)

router.put(
    "/parcel/destination/change/:id",
    (req, res, next) =>{
        const { destination } = req.body;
        const { auth } = req.headers;
        const token = auth;
        if(!destination){
            return res.status(400).json({
                message: "Please Provide a value for Destination",
            })
        }

        if(!token){
            return res.status(401).json({
                message: "You are not authorised on this platform",
            })
        }
        next();
    },
    async (req, res, next) =>{
        const { auth } = req.headers;
        const token = auth;
        try{
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "user")
            await parcelauthorisation(req.params.id, req.user._id);
            const thisFunction = "Change the Destination"
            await checkParcelStatus(req.params.id, thisFunction);
        } catch (e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        const { destination } = req.body;
        try {
            const result = await changeDestination(id, destination);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }
    }
)

router.put(
    "/parcel/cancel/:id",
    async (req, res, next) =>{
        const { auth } = req.headers;
        const token = auth;
        try{
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "user")
            await parcelauthorisation(req.params.id, req.user._id);
            const thisFunction = "Cancel"
            await checkParcelStatus(req.params.id, thisFunction);
        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        const status = "cancelled";

        try {
            const thisMessage = "Delivery Order Cancelled Successfully";
            const result = await changeStatus(id, status, thisMessage);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }

    }
)


router.put(
    "/parcel/status/change/:id",
    (req, res, next) => {
        const { error } = statusValidation(req.body);
        if(error) {
            return res.status(400).json({
                message: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res, next) =>{
        const { auth } = req.headers;
        const token = auth;
        try{
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "admin")
            const thisFunction = "Change the Status"
            await checkParcelStatus(req.params.id, thisFunction);
        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        try {
            const thisMessage = "Status Changed successfully"
            const result = await changeStatus(id, status, thisMessage);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }

    }
)



router.put(
    "/parcel/location/change/:id",
    (req, res, next) => {
        const { location } = req.body;
        const { auth } = req.headers;
        const token = auth;
        if(!location){
            return res.status(400).json({
                message: "Please Provide a value for Location",
            })
        }

        if(!token){
            return res.status(401).json({
                message: "You are not authorised on this platform",
            })
        }
        next();
    },
    async (req, res, next) =>{
        const { auth } = req.headers;
        const token = auth;
        try{
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "admin")
            const thisFunction = "Change the Location"
            await checkParcelStatus(req.params.id, thisFunction);
        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        const { location } = req.body;

        try {
            const result = await changeLocation(id, location);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }

    }
)


router.get(
    "/parcel/all",
    async (req, res, next) =>{
        const { auth } = req.headers;
        const token = auth;
        try{
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "admin")
        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        try {
            const result = await getAllParcels();
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }

    }
)

// router.get(
//     "/parcel/all",
//     authorisationByToken,
//     async (req, res, next) =>{
//         const { auth } = req.headers;
//         const token = auth;
//         try{
//             await authenticationById(token, req, res);
//             await authorisationById(token, "YES")
//         } catch(e) {
//             console.log(e);
//             return res.status(e.code).json(e);
//         }
//         next();
//     },
//     async (req, res) => {
//         try {
//             const result = await getAllParcels();
//             return res.status(200).json(result);
//         } catch (e) {
//             console.log(e);
//             return res.status(e.code).json(e);
//         }
//
//     }
// )

router.get(
    "/parcel",
    async (req, res, next) =>{
        const { auth } = req.headers;
        const token = auth;
        try{
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "user")
        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        try {
            const result = await getParcelsByUserId(req.user._id);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }

    }
)

router.get(
    "/parcel/:id",
    async (req, res, next) =>{
        const { id } = req.params;
        const { auth } = req.headers;
        const token = auth;
        try{
            await authenticationnByToken(token, req);
            await authorisationById(req.user._id, "user")
            await parcelauthorisation(req.params.id, req.user._id);
        } catch(e) {
            return res.status(e.code).json(e);
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        try {
            const result = await getParcelsByUserAndParcelId(req.user._id, id);
            return res.status(200).json(result);
        } catch (e) {
            console.log(e);
            return res.status(e.code).json(e);
        }

    }
)

module.exports = router;
