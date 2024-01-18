const {Router} = require('express')
const router = Router()

router.get('/', (req, res) => {
    res.render('home', {
        title: 'Главная страница',
        isHome: true
    })
})

module.exports = router
