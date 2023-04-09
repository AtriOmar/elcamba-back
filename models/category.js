const connection = require('../config/connection') // import the connection from the config to the database to make db queries

// Build a user Model to export to the controllers
const Category = {
    selectAll: cb => {
        const queryString = `SELECT * 
      FROM categories;`
        connection.query(queryString, (err, results) => {
            if (err) throw err
            cb(results)
        })
    },
    getCategoryById: (id, done) => {
        const queryString = `SELECT * 
      FROM categories 
      WHERE id=? 
      LIMIT 1;`
        connection.execute(queryString, [id], (err, user) => {
            if (err) {
                return done(err, user)
            }
            return done(null, user[0])
        })
    },
    selectOneByName: (username, cb) => {
        const queryString = `SELECT * 
      FROM categories  
      WHERE name=? 
      LIMIT 1;`
        connection.execute(queryString, [username], (err, results) => {
            if (err) throw err
            cb(results)
        })
    },
    deleteOne: (id, cb) => {
        const queryString = `DELETE FROM categories 
    WHERE id=?;`
        connection.execute(queryString, [id], (err, result) => {
            if (err) throw err
            cb(result)
        })
    },
    insertOne: (vals, cb) => {
        const queryString = `INSERT INTO categories 
    (name)
     VALUES (?)`
        connection.execute(queryString, vals, (err, result) => {
            if (err) throw err
            cb(result)
        })
    },
    updateOne: (vals, id) => {
        const array = [vals.name, id];
        const queryString = 'UPDATE categories SET name=? WHERE id=?;';
        return new Promise((resolve, reject) => {
            connection.execute(queryString, array).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        });
    }
}
module.exports = Category
