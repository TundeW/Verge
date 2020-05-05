const queries = require("./query");
const db = require("./database");
const moment = require("moment");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


async function createNewUser(type, body) {
    const {
        first_name,
        last_name,
        email,
        password,
        state
    } = body;
    const d = new Date();
    const created_at = moment(d).format("YYYY-MM-DD HH:mm:ss");

    const queryObj = {
        text: queries.addNewUser,
        values: [first_name, last_name, email, password, state, type, created_at, created_at],
    };

    try{
        const { rowCount } = await db.query(queryObj);
        if (rowCount == 0) {
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Could not create user account",
            });
        }

        if (rowCount > 0){
            return Promise.resolve({
                status: "success",
                code: 201,
                message: "User Account Successfully Created",
            });
        }
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error creating User Account",
        });
    }
}

async function checkIfUserDoesNotExistBefore(email){
    const queryObj = {
        text: queries.findUserByEmail,
        values: [email],
    };

    try{
        const { rowCount } = await db.query(queryObj);
        if (rowCount == 0) {
            return Promise.resolve();
        }
        if (rowCount > 0) {
            return Promise.reject({
                status: "error",
                code: 409,
                message: "Email Already Exists",
            });
        }
    } catch(e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error finding email",
        });
    }
}

async function checkIfEmailAndPasswordMatch(body){
    const { email, password } = body;
    const queryObj = {
        text: queries.findUserByEmailAndPassword,
        values: [email, password],
    };

    try{
        const { rows, rowCount } = await db.query(queryObj);
        if (rowCount == 0){
            return Promise.reject({
                status: "bad request",
                code: 400,
                message: "The username and password combination you entered doesn't belong to a user.",
            });
        }

        if (rowCount > 0){
            return Promise.resolve({
                status: "success",
                code: 200,
                message: "Login Successful...",
                data: {
                    user: {
                        id: rows[0].id
                    }
                },
            });
        }



    } catch (e) {
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error fetching all blogs",
        });
    }
}

async function createNewParcel(user_id, body){
    const {
        price,
        weight,
        location,
        destination,
        sender_name,
        sender_note,
    } = body;
    const status = "pending";
    const d = new Date();
    const created_at = moment(d).format("YYYY-MM-DD HH:mm:ss");

    const queryObj={
        text: queries.addNewParcel,
        values: [user_id, price, weight, location, destination, sender_name, sender_note, status, created_at, created_at]
    }

    try{
        const { rowCount } = await db.query(queryObj);
        if (rowCount == 0) {
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Could not create Parcel Delivery Order",
            });
        }

        if (rowCount > 0){
            return Promise.resolve({
                status: "success",
                code: 201,
                message: "Parcel Delivery Order created successfully"
            });
        }
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error creating Parcel Delivery Order"
        });
    }
}


async function authenticationById(id){
    const queryObj = {
        text: queries.selectIsadminById,
        values: [id],
    }

    try {
        const { rowCount } = await db.query(queryObj);
        if (rowCount == 0) {
            return Promise.reject({
                status: "forbidden",
                code: 403,
                message: "This user is not authenticated on this platform "
            })
        }

        if (rowCount > 0) {
            return Promise.resolve();
        }
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 409,
            message: "Error authenticating user",
        });
    }

}

async function authorisationById(id, role){
    const queryObj = {
        text: queries.selectTypeById,
        values: [id],
    }

    try{
        const { rows, rowCount } = await db.query(queryObj);
        if (rows[0].type == role){
            return Promise.resolve();
        }

        if (rows[0].type != role) {
            return Promise.reject({
                status: "forbidden",
                code: 403,
                message: "This user is not authorised to carry out this function",
            })
        }
    } catch(e) {
        console.log(e)
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error authorizing user",
        })
    }
}

async function changeDestination(id, destination){
    const d = new Date();
    const updated_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
    const queryObj = {
        text: queries.updateDestinationById,
        values: [destination, id, updated_at],
    }

    try{
        const { rowCount } = await db.query(queryObj);
        if (rowCount == 0){
            return Promise.reject({
                status: "error",
                code: 500,
                message: "parcel with id not found",
            });
        }
        if(rowCount > 0){
            return Promise.resolve({
                status: "success",
                code: 200,
                message: "Destination changed successfully",
            })
        }
    } catch (e){
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error changing Destination",
        })
    }
}

async function parcelauthorisation(id_parcel, id_user ){
    const queryObj = {
        text: queries.findUserIdByParcelId,
        values: [id_parcel],
    }

    try{
        const { rows, rowCount } = await db.query(queryObj);
        if(rowCount == 0){
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Parcel with this id does not exist"
            })
        }
        if (rows[0].user_id == id_user){
            return Promise.resolve();
        }

        if (rows[0].user_id != id_user){
            return Promise.reject({
                status: "unauthorised",
                code: 401,
                message: "User is not authorised to access this parcel",
            })
        }
    } catch (e){
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error with parcel authorisation",
        })
    }
}

async function checkParcelStatus(id_parcel, thisFunction){
    const queryObj = {
        text: queries.findStatusByParcelId,
        values: [id_parcel],
    }

    try {
        const { rows, rowCount } = await db.query(queryObj);
        if(rowCount == 0){
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Parcel with this id does not exist"
            })
        }
        if (rows[0].status.toLowerCase() == "delivered" || rows[0].status.toLowerCase() == "cancelled") {

            return Promise.reject({
                status: "error",
                code: 500,
                message: "Cannot " + thisFunction + " when the Order has been " + rows[0].status.toLowerCase()
            })
        }

        if (rows[0].status.toLowerCase() != "delivered" && rows[0].status.toLowerCase() != "cancelled") {
            // console.log(rows[0].status.toLowerCase())
            return Promise.resolve();
        }
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error with status authorisation"
        })
    }
}


async function changeStatus (id, status, thisMessage) {
    const d = new Date();
    const updated_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
    const queryObj = {
        text: queries.updateStatusById,
        values: [status.toLowerCase(), id, updated_at],
    }

    try{
        const { rowCount } = await db.query(queryObj);
        if ( rowCount == 0){
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Parcel with id not found",
            })
        }
        if(rowCount > 0){
            return Promise.resolve({
                status: "success",
                code: 200,
                message: thisMessage,
            })
        }
    } catch (e){
        console.log(e);
        return Promise.reject ({
            status: "error",
            code: 500,
            message: "Error changing Status",
        })
    }
}

async function changeLocation (id, location) {
    const d = new Date();
    const updated_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
    const queryObj = {
        text: queries.updateLocationById,
        values: [location, id, updated_at],
    }

    try{
        const { rowCount } = await db.query(queryObj);
        if ( rowCount == 0){
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Parcel with id not found",
            })
        }
        if(rowCount > 0){
            return Promise.resolve({
                status: "success",
                code: 200,
                message: "location Changed successfully",
            })
        }
    } catch (e){
        console.log(e);
        return Promise.reject ({
            status: "error",
            code: 500,
            message: "Error changing location",
        })
    }
}

async function getAllParcels() {
    const queryObj = {
        text: queries.findAllParcels,
    };
    try {
        const { rows } = await db.query(queryObj);
        return Promise.resolve({
            status: "success",
            code: 200,
            message: "Successfully fetched all Parcels",
            data: rows,
        });
    } catch (e) {
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error fetching all Parcels",
        });
    }
}

async function getParcelsByUserId(user_id) {
    const queryObj = {
        text: queries.findParcelsByUserId,
        values: [user_id],
    };
    try {
        const { rows } = await db.query(queryObj);
        return Promise.resolve({
            status: "success",
            code: 200,
            message: "Successfully fetched all Parcels",
            data: rows,
        });
    } catch (e) {
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error fetching Parcels",
        });
    }
}

async function getParcelsByUserAndParcelId(user_id, parcel_id) {
    const queryObj = {
        text: queries.findParcelsByUserAndParcelId,
        values: [user_id, parcel_id],
    };
    try {
        const { rows } = await db.query(queryObj);
        return Promise.resolve({
            status: "success",
            code: 200,
            message: "Successfully fetched all Parcels",
            data: rows[0],
        });
    } catch (e) {
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error fetching Parcels",
        });
    }
}

async function authenticationnByToken(token, req){
    // const { auth } = req.headers;
    // const token = auth;
    if(!token) {
        return Promise.reject ({
            status: "forbidden",
            code: 401,
            message: "Access Denied",
        })
    }

    try{
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        // console.log(req.user)
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 400,
            message: "Invalid Token",
        });
    }


}


module.exports = {
    createNewUser,
    checkIfUserDoesNotExistBefore,
    checkIfEmailAndPasswordMatch,
    createNewParcel,
    authenticationById,
    authorisationById,
    changeDestination,
    parcelauthorisation,
    checkParcelStatus,
    changeStatus,
    changeLocation,
    getAllParcels,
    getParcelsByUserId,
    getParcelsByUserAndParcelId,
    authenticationnByToken
};
