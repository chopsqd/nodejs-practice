const {body} = require('express-validator/check')
const User = require('../models/User')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .custom(async (value, {req}) => {
            try {
                const candidate = await User.findOne({email: value})
                if(candidate) {
                    return Promise.reject('Такой email уже занят')
                }
            } catch (error) {
                console.log(error)
            }
        })
        .normalizeEmail(),
    body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Пароли не совпадают')
            }
            return true
        })
        .trim(),
    body('name')
        .isLength({min: 2})
        .withMessage('Имя должно быть минимум 3 символа')
        .trim()
]

exports.courseValidators = [
    body('title')
        .isLength({min: 3})
        .withMessage('Минимальная длина названия 3 символа')
        .trim(),
    body('price')
        .isNumeric()
        .withMessage('Введите корректную цену'),
    body('img')
        .isURL()
        .withMessage('Введите корректный url картинки')
]
