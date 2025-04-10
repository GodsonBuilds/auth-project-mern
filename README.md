initialisation projet back:
1- npm init
2-  Tu installes une stack backend complète avec Express.js et plusieurs middlewares utiles ! Voici un petit récapitulatif de chaque package :

📦 Packages et leurs rôles
express → Framework minimaliste pour créer des serveurs web en Node.js.
nodemon, un package qui rafraîchit le serveur à chaque modification.
bcryptjs → Pour hacher et comparer des mots de passe (cryptage sécurisé).

cookie-parser → Permet de gérer les cookies HTTP dans Express.

cors → Active le Cross-Origin Resource Sharing (CORS) pour autoriser les requêtes depuis d’autres domaines.

helmet → Sécurise Express en configurant divers en-têtes HTTP.

joi → Valide les données (ex: formulaires, requêtes API).

jsonwebtoken (JWT) → Gère l’authentification avec des tokens JWT.

mongoose → ORM pour interagir avec une base de données MongoDB.

nodemailer → Permet l’envoi d’e-mails depuis le backend.

npm install jsonwebtoken --> generer token jwt
npm install uuid