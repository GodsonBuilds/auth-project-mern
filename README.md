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
npm install uuid  -->token verify-email
 **ajouter une image de profil à un utilisateur**
 - Va sur https://cloudinary.com/
- Crée un compte gratuit
- Récupère tes clés d’API : cloud_name, api_key, api_secret
- Installe le package cloudinary : 
- npm install cloudinary multer multer-storage-cloudinary
---------------------------------------------------
🧠 **Objectif de cette étape 2** :
- Comprendre comment relier deux collections (ex: User et Post)
- Faire un CRUD complet sur les posts
- Utiliser Mongoose pour les relations (avec populate)

🧠 **Objectif de cette étape 3** :
✅ Gérer les rôles
📸 Gérer plusieurs images
💬 Ajouter les commentaires + thread
❤️ Gérer les likes/dislikes
📌 Gérer les favoris
📊 Créer des stats et validation côté admin