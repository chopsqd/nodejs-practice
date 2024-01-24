module.exports = function(email, token) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Восстановление пароля',
        html: `
            <h1>Вы забыли пароль?</h1>
            <p>Если нет, то проигнорируйте данное письмо</p>
            <p>Иначе нажмите на ссылку ниже</p>
            <p><a href="${process.env.BASE_URL}/password/${token}">Восстановить пароль</a></p>
            <hr />
            <a href="${process.env.BASE_URL}">Магазин курсов</a>
        `
    }
}
