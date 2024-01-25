const {Router} = require('express')
const router = Router()
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, async (req, res) => {
    try {
        res.render('profile', {
            title: 'Профиль',
            isProfile: true,
            user: req.user.toObject()
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)

        const changed = {
            name: req.body.name
        }

        if(req.file) {
            changed.avatarUrl = req.file.path
        }

        Object.assign(user, changed)
        await user.save()

        res.redirect('/profile')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
