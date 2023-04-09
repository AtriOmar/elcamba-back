const connection = require('../config/connection') // import the connection from the config to the database to make db queries

// Build a user Model to export to the controllers
const Product = {
    selectAll: cb => {
        const queryString = `SELECT p.*, c.id AS category_id, c.name AS category_name 
        FROM products AS p 
        INNER JOIN categories AS c 
        ON p.category_id=c.id;`
        connection.query(queryString, (err, results) => {
            if (err) throw err
            cb(results)
        })
    },
    getProductById: (id, done) => {
        const queryString = `SELECT * 
        FROM products AS p 
        INNER JOIN categories AS c 
        ON p.category_id=c.id WHERE id=? 
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
        FROM products AS p 
        INNER JOIN categories AS c 
        ON p.category_id=c.id 
        WHERE name=? 
        LIMIT 1;`
        connection.execute(queryString, [username], (err, results) => {
            if (err) throw err
            cb(results)
        })
    },
    deleteOne: (id, cb) => {
        const queryString = `DELETE FROM products 
    WHERE id=?;`
        connection.execute(queryString, [id], (err, result) => {
            if (err) throw err
            cb(result)
        })
    },
    insertOne: (vals, cb) => {
        const queryString = `INSERT INTO products 
    (category_id, name, picture, description, price, isLocal, zeroWaste, isNatural, recyclable)
     VALUES (?,?,?,?,?,?,?,?,?)`
        connection.execute(queryString, vals, (err, result) => {
            if (err) throw err
            cb(result)
        })
    },
    updateOne: (vals, id, cb) => {
        vals.push(id)
        const queryString =
            'UPDATE products SET category_id=?, name=?, picture=?, description=?, price=?, isLocal, zeroWaste, isNatural, recyclable WHERE id=?;'
        connection.execute(queryString, vals, (err, result) => {
            if (err) throw err
            cb(result)
        })
    }
}
module.exports = Product
