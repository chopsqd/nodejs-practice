const {Router} = require('express')
const Course = require('../models/Course')
const authMiddleware = require('../middleware/auth')
const {mapCartItems, computePrice} = require("../utils/cart");
const router = Router()

router.post('/add', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.body.id)
        await req.user.addToCart(course)

        res.redirect('/cart')
    } catch (error) {
        console.log(error)
    }
})

router.delete('/remove/:id', authMiddleware, async (req, res) => {
    try {
        await req.user.removeFromCart(req.params.id)
        const user = await req.user.populate('cart.courses.courseId')

        const courses = mapCartItems(user.cart)
        const cart = {courses, price: computePrice(courses)}

        res.status(200).json(cart)
    } catch (error) {
        console.log(error)
    }
})

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await req.user.populate('cart.courses.courseId')

        const courses = mapCartItems(user.cart)

        res.render('cart', {
            title: 'Корзина',
            isCart: true,
            courses,
            price: computePrice(courses)
        })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
