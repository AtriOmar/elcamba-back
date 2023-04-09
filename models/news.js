const connection = require('../config/connection') // import the connection from the config to the database to make db queries

// Build a user Model to export to the controllers
const News = {
    selectAll: cb => {
        const queryString = `SELECT * 
        FROM news;`
        connection.query(queryString, (err, results) => {
            if (err) throw err
            cb(results)
        })
    },
    getNewsById: (id, done) => {
        const queryString = `SELECT * 
        FROM news  
        WHERE id=? 
        LIMIT 1;`
        connection.execute(queryString, [id], (err, news) => {
            if (err) {
                return done(err, news)
            }
            return done(null, news[0])
        })
    },
    selectOneByTitle: (title, cb) => {
        const queryString = `SELECT * 
        FROM news  
        WHERE name=? 
        LIMIT 1;`
        connection.execute(queryString, [title], (err, results) => {
            if (err) throw err
            cb(results)
        })
    },
    deleteOne: (id, cb) => {
        const queryString = `DELETE FROM news 
    WHERE id=?;`
        connection.execute(queryString, [id], (err, result) => {
            if (err) throw err
            cb(result)
        })
    },
    insertOne: (vals, cb) => {
        const queryString = `INSERT INTO news 
    (title, picture, content)
     VALUES (?,?,?)`
        connection.execute(queryString, vals, (err, result) => {
            if (err) throw err
            cb(result)
        })
    },
    updateOne: (vals, id, cb) => {
        vals.push(id)
        const queryString =
            'UPDATE news SET title=?, picture=?, content=? WHERE id=?;'
        connection.execute(queryString, vals, (err, result) => {
            if (err) throw err
            cb(result)
        })
    }
}
module.exports = News
