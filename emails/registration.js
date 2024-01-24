module.exports = function(email) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Аккаунт создан',
        html: `
            <h1>Добро пожаловать в наш магазин</h1>
            <p>Вы успешно создали аккаунт с email: ${email}</p>
            <hr />
            <a href="${process.env.BASE_URL}">Магазин курсов</a>
        `
    }
}
