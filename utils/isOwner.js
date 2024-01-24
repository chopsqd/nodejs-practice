module.exports = function (course, req) {
    return course.userId.toString() === req.user._id.toString()
}
