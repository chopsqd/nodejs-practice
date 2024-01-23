const {Router} = require('express')
const Course = require('../models/Course')
const authMiddleware = require('../middleware/auth')
const router = Router()

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('userId', 'email name')

        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            courses
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)

        res.render('course', {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course
        })
    } catch (error) {
        console.log(error)
    }
})

router.get('/:id/edit', authMiddleware, async (req, res) => {
    try {
        if(!req.query.allow) {
            return res.redirect('/')
        }

        const course = await Course.findById(req.params.id)

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', authMiddleware, async (req, res) => {
    try {
        const {id, ...update} = req.body
        await Course.findByIdAndUpdate(id, update)

        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

router.post('/remove', authMiddleware, async (req, res) => {
    try {
        await Course.deleteOne({_id: req.body.id})

        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
