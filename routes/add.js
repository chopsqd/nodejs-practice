const {Router} = require('express')
const {validationResult} = require('express-validator/check')
const Course = require('../models/Course')
const authMiddleware = require('../middleware/auth')
const {courseValidators} = require('../utils/validators')
const router = Router()

router.get('/', authMiddleware, (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    })
})

router.post('/', authMiddleware, courseValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(422).render('add', {
                title: 'Добавить курс',
                isAdd: true,
                error: errors.array()[0].msg,
                data: {...req.body}
            })
        }

        const course = new Course({...req.body, userId: req.user})
        await course.save()

        res.redirect('/courses')
    } catch(error) {
        console.log(error)
    }
})

module.exports = router
