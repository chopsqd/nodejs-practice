const {Router} = require('express')
const Course = require('../models/Course')
const router = Router()

router.get('/', (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    })
})

router.post('/', async (req, res) => {
    try {
        const course = new Course({...req.body, userId: req.user})

        await course.save()

        res.redirect('/courses')
    } catch(error) {
        console.log(error)
    }
})

module.exports = router
