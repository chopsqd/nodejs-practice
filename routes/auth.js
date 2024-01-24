const {Router} = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require("../models/User");
const transporter = require("../utils/transporter");
const regEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const router = Router()

router.get('/', (req, res) => {
    res.render('authorization', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth#login')
    })
})

router.get('/reset', (req, res) => {
    res.render('reset', {
        title: 'Восстановление пароля',
        error: req.flash('error')
    })
})

router.get('/password/:token', async (req, res) => {
    try {
        if(!req.params.token) {
            return res.redirect('/auth#login')
        }

        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(!user) {
            req.flash('error', 'Пользователь не найден')
            return res.redirect('/auth#login')
        }

        res.render('password', {
            title: 'Обновление пароля',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body

        const candidate = await User.findOne({email})
        if(!candidate) {
            req.flash('loginError', 'Пользователя с таким email не существует')
            return res.redirect('/auth#login')
        }

        const areSame = await bcrypt.compare(password, candidate.password)
        if(!areSame) {
            req.flash('loginError', 'Неправильные данные для входа')
            return res.redirect('/auth#login')
        }

        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(err => {
            if(err) {
                throw err
            }

            res.redirect('/')
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/register', async (req, res) => {
    try {
        const {email, password, confirm, name} = req.body

        if(password !== confirm) {
            req.flash('registerError', 'Пароли не совпадают')
            return res.redirect('/auth#register')
        }

        const candidate = await User.findOne({email})
        if(candidate) {
            req.flash('registerError', 'Пользователь с таким email уже существует')
            return res.redirect('/auth#register')
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const user = new User({
            email, name, password: hashPassword, cart: {courses: []}
        })
        await user.save()

        res.redirect('/auth#login')

        await transporter.sendMail(regEmail(email))
    } catch (error) {
        console.log(error)
    }
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (error, buffer) => {
            if(error) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})

            if(candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000

                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))

                res.redirect('/auth#login')
            } else {
                req.flash('error', 'Пользователь не найден')
                res.redirect('/auth/reset')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if(user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined

            await user.save()
            res.redirect('/auth#login')
        } else {
            req.flash('error', 'Время жизни токена истекло')
            res.redirect('/auth#login')
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
