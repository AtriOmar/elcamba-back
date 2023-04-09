const db = require('../models/index.js')
const { check, body, validationResult } = require('express-validator');

function removeSpaces(req, res, next) {
    if (req.files?.image) {
        req.files.image.name = req.files.image.name.replace(/\s/g, '');
    }
    next()
}

module.exports = {
    createNewNews: [
        check('image').custom((value, { req }) => { if (!req.files) { throw new Error('No image uploaded.'); } return true; }),
        removeSpaces,
        body('title').notEmpty().withMessage('Title field is required').isLength({ max: 50 }).withMessage('Title is maximum 50 characters'),
        (req, res) => {
            if (req.isAuthenticated()) {
                const errors = validationResult(req);
                const errorMessages = errors.array().reduce((accumulator, error) => {
                    accumulator[error.param] = error.msg;
                    return accumulator;
                }, {});
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errorMessages });
                }

                if (req.files?.image) {
                    var file = req.files.image
                    var picture = `uploads/images/${file.name}`
                    file.mv(`./public/uploads/images/${file.name}`, err => {
                        if (err) {
                            console.error(err);
                        }
                    })
                } else picture = ''

                const reqbody = req.body

                const news = [
                    reqbody.title,
                    picture,
                    reqbody.content,
                ]

                db.News.insertOne(news, result => {
                    // save new user with hashed password to database
                    res.status(200).json({ id: result.insertId })
                })
            } else {
                res.status(400)
            }
        }],
    getAllNews: (req, res) => {
        db.News.selectAll(data => {
            res.status(200).json(data)
        })
    },
    getNewsById: (req, res) => {
        db.News.selectOneById(req.params.id, data => {
            res.status(200).json(data)
        })
    },
    updateNewsById: (req, res) => {
        const body = req.body

        db.News.updateOne(body, req.params.id, result => {
            if (result.changedRows === 0) {
                res.status(204).end()
            } else {
                res.status(200).end()
            }
        })
    },
    deleteNewsById: (req, res) => {
        db.News.deleteOne(req.params.id, data => {
            res.status(200).json(data)
        })
    }
}
