const fetch = require('node-fetch');

async function validateCaptcha(token) {
    try {
        console.log(token);
        console.log(process.env.CAPTCHA_SECRET);
        const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${token}`,
        {
            method: "POST",
        }
        );
        const res = await response.json();
        console.log(res);
        return res['success'];
    } catch(e) {
        throw e;
    }
}

module.exports = {validateCaptcha}