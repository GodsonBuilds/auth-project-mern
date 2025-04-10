const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = async function sendForgotPasswordCode(email, code) {
  const logoUrl = "https://images.unsplash.com/photo-1496200186974-4293800e2c20?w=64&h=64&fit=crop&auto=format";

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Code OTP</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: auto;
              background: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
              display: block;
              margin: 0 auto 20px;
              width: 64px;
              height: 64px;
              border-radius: 50%;
            }
            h2 {
              color: #4F46E5;
              font-size: 36px;
              text-align: center;
              margin: 20px 0;
              letter-spacing: 4px;
            }
            p {
              font-size: 16px;
              margin-bottom: 10px;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${logoUrl}" alt="Logo" class="logo" />
            <h1>Code de réinitialisation</h1>
            <p>Bonjour,</p>
            <p>Voici votre code à 6 chiffres pour réinitialiser votre mot de passe :</p>
            <h2>${code}</h2>
            <p>Ce code est valable pendant 10 minutes.</p>
            <p>Si vous n'avez pas demandé cette opération, veuillez ignorer cet email.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Votre Entreprise. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
};
