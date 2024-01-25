const {Router} = require('express')
const {validationResult} = require('express-validator/check')
const Course = require('../models/Course')
const authMiddleware = require('../middleware/auth')
const isOwner = require('../utils/isOwner')
const {courseValidators} = require('../utils/validators')
const router = Router()

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('userId', 'email name')

        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
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
        if(!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/edit', authMiddleware, courseValidators, async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(422).redirect(`/courses/${req.body.id}/edit?allow=true`)
        }

        const course = await Course.findById(req.body.id)

        if(!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        Object.assign(course, req.body)
        await course.save()

        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

router.post('/remove', authMiddleware, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })

        res.redirect('/courses')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
