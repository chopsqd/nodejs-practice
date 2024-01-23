const {Schema, model} = require('mongoose')

const User = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        courses: [
            {
                count: {
                    type: Number,
                    required: true,
                    default: 1
                },
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true
                }
            }
        ]
    },
})

User.methods.addToCart = function(course) {
    const courses = [...this.cart.courses]
    const idx = courses.findIndex(c => c.courseId.toString() === course._id.toString())

    if(idx >= 0) {
        courses[idx].count++
    } else {
        courses.push({
            courseId: course._id,
            count: 1
        })
    }

    this.cart = {courses}

    return this.save()
}

User.methods.removeFromCart = function(id) {
    let courses = [...this.cart.courses]
    const idx = courses.findIndex(c => c.courseId.toString() === id.toString())

    if (courses[idx].count === 1) {
        courses = courses.filter(c => c.courseId.toString() !== id.toString())
    } else {
        courses[idx].count--
    }

    this.cart = {courses}

    return this.save()
}

User.methods.clearCart = function() {
    this.cart = {courses: []}

    return this.save()
}

module.exports = model('User', User)
