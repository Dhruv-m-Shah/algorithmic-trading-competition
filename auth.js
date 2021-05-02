const fetch = require('node-fetch');

async function validateCaptcha(token) {
  console.log(token);
  console.log(process.env.CAPTCHA_SECRET);
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${token}`,
    {
      method: "POST",
    }
  );
  const res = await response.json()['success'];
  return res;
}

module.exports = {validateCaptcha}