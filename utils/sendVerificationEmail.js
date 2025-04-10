const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = async function  sendVerificationEmail(email, token, userId) {
  const url = `http://localhost:3000/api/auth/verify-email?token=${token}&id=${userId}`;
  
  const logoUrl = "https://images.unsplash.com/photo-1496200186974-4293800e2c20?w=64&h=64&fit=crop&auto=format";

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Vérification de votre adresse email",
    html: `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vérification Email</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              padding: 32px;
            }
            .header {
              text-align: center;
              margin-bottom: 32px;
            }
            .logo {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              margin-bottom: 12px;
            }
            .button {
              display: inline-block;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              margin: 24px 0;
              font-weight: 500;
            }
            .footer {
              text-align: center;
              font-size: 14px;
              color: #666;
              margin-top: 32px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="Logo" class="logo">
              <h1>Bienvenue !</h1>
            </div>
            
            <p>Bonjour,</p>
            
            <p>Merci d'avoir créé un compte. Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${url}" class="button">Vérifier mon email</a>
            </div>
            
            <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
            <p style="word-break: break-all; font-size: 14px; color: #666;">
              ${url}
            </p>
            
            <p>Ce lien expirera dans 24 heures pour des raisons de sécurité.</p>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
              <p>&copy; ${new Date().getFullYear()} Votre Entreprise. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}