const {Router} = require('express')
const Course = require('../models/Course')
const authMiddleware = require('../middleware/auth')
const router = Router()

router.get('/', authMiddleware, (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    })
})

router.post('/', authMiddleware, async (req, res) => {
    try {
        const course = new Course({...req.body, userId: req.user})

        await course.save()

        res.redirect('/courses')
    } catch(error) {
        console.log(error)
    }
})

module.exports = router
