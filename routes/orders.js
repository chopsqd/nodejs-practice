const {Router} = require('express')
const Order = require('../models/Order')
const router = Router()

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({'user.userId': req.user._id})
            .populate('user.userId')

        res.render('orders', {
            title: 'Заказы',
            isOrders: true,
            orders: orders.map(order => ({
                ...order._doc,
                price: order.courses.reduce((total, current) => {
                    return total += current.count * current.course.price
                }, 0)
            }))
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/', async (req, res) => {
    try {
        const user = await req.user.populate('cart.courses.courseId')

        const courses = user.cart.courses.map(c => ({
            count: c.count,
            course: {...c.courseId._doc}
        }))

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses
        })

        await order.save()
        await req.user.clearCart()

        res.redirect('/orders')
    } catch (error) {
        console.log(error)
    }
})

module.exports = router
