const queries = {
    addNewUser: `
    INSERT INTO users(
        first_name,
        last_name,
        email,
        password,
        state,
        type,
        created_at,
        updated_at
    ) VALUES($1, $2, $3, crypt( $4, gen_salt('bf')), $5, $6, $7, $8) RETURNING *`,

    findUserByEmail:`
    SELECT * FROM users WHERE email=($1)
    `,

    findUserByEmailAndPassword:`
    SELECT id FROM users WHERE email=($1) AND password=crypt($2, password)
    `,

    addNewParcel:`
    INSERT INTO parcels(
        user_id,
        price,
        weight,
        location,
        destination,
        sender_name,
        sender_note,
        status,
        created_at,
        updated_at
    ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,

    selectTypeById:`
    SELECT type FROM users where id=($1)
    `,

    updateDestinationById:`
    UPDATE parcels SET destination=($1), updated_at=($3) WHERE id=($2)
    `,

    findUserIdByParcelId:`
    SELECT user_id FROM parcels WHERE id=($1)
    `,

    findStatusByParcelId:`
    SELECT status FROM parcels WHERE id=($1)
    `,

    updateStatusById: `
    UPDATE parcels SET status=($1), updated_at=($3) WHERE id=($2)
    `,

    updateLocationById: `
    UPDATE parcels SET location=($1), updated_at=($3) WHERE id=($2)
    `,

    findAllParcels: `
    SELECT * FROM parcels
    `,

    findParcelsByUserId: `
    SELECT * FROM parcels WHERE user_id=($1)
    `,

    findParcelsByUserAndParcelId: `
    SELECT * FROM parcels WHERE user_id=($1) AND id=($2)
    `,
};

module.exports = queries;
