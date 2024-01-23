function mapCartItems(cart) {
    return cart.courses.map(c => ({
        ...c.courseId._doc,
        id: c.courseId.id,
        count: c.count
    }))
}

function computePrice(courses) {
    return courses.reduce((total, course) => total += course.price * course.count,0)
}

module.exports = {mapCartItems, computePrice}
