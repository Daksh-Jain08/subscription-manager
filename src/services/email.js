const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

const oauth2client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const sendEmail = async (to, subject, text) => {
    try {
        const accessToken = await oauth2client.getAccessToken();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        })
        const message = `Email sent to ${to}`
        console.log(message)
    } catch(err){
        console.log(`email sending failed: ${err}`)
    }
}

module.exports = sendEmail;