const connection = require('../config/connection') // import the connection from the config to the database to make db queries

// Build a user Model to export to the controllers
const Partner = {
    selectAll: cb => {
        const queryString = `SELECT * 
        FROM partners;`
        connection.query(queryString, (err, results) => {
            if (err) throw err
            cb(results)
        })
    },
    getPartnerById: (id, done) => {
        const queryString = `SELECT * 
        FROM partners  
        WHERE id=? 
        LIMIT 1;`
        connection.execute(queryString, [id], (err, partner) => {
            if (err) {
                return done(err, partner)
            }
            return done(null, partner[0])
        })
    },
    selectOneByTitle: (title, cb) => {
        const queryString = `SELECT * 
        FROM partners  
        WHERE name=? 
        LIMIT 1;`
        connection.execute(queryString, [title], (err, results) => {
            if (err) throw err
            cb(results)
        })
    },
    deleteOne: (id, cb) => {
        const queryString = `DELETE FROM partners 
    WHERE id=?;`
        connection.execute(queryString, [id], (err, result) => {
            if (err) throw err
            cb(result)
        })
    },
    insertOne: (vals, cb) => {
        const queryString = `INSERT INTO partners 
    (name, email, tel, picture)
     VALUES (?,?,?,?)`
        connection.execute(queryString, vals, (err, result) => {
            if (err) throw err
            cb(result)
        })
    },
    updateOne: (vals, id, cb) => {
        vals.push(id)
        const queryString =
            'UPDATE partners SET name=?, email=?, tel=?, picture=? WHERE id=?;'
        connection.execute(queryString, vals, (err, result) => {
            if (err) throw err
            cb(result)
        })
    }
}
module.exports = Partner
