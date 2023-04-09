const db = require('../models/index.js')

module.exports = {
    createNewCategory: (req, res) => {
        if (req.isAuthenticated()) {
            const body = req.body

            const category = [
                body.name,
            ]
            // console.log(userData)
            db.Category.insertOne(category, result => {
                // save new user with hashed password to database
                res.status(200).json({ id: result.insertId })
            })
        } else {
            res.status(400)
        }
    },
    getAllCategories: (req, res) => {
        db.Category.selectAll(data => {
            res.status(200).json(data)
        })
    },
    getCategoryById: (req, res) => {
        db.Category.selectOneById(req.params.id, data => {
            res.status(200).json(data)
        })
    },
    updateCategoryById: (req, res) => {
        const body = req.body

        db.Category.updateOne(body, req.params.id).then(result => {
            if (result.changedRows === 0) {
                res.status(204).end()
            } else {
                res.status(200).end()
            }
        }).catch(err => {
            res.send(err)
        })
    },
    deleteCategoryById: (req, res) => {
        db.Category.deleteOne(req.params.id, data => {
            res.status(200).json(data)
        })
    }
}
