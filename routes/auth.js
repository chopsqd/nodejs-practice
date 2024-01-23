const {Router} = require('express')
const bcrypt = require('bcryptjs')
const User = require("../models/User");
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
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
