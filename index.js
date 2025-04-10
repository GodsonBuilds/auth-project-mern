require('dotenv').config();
const express = require('express');
const  helmet  = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const mongoose = require('mongoose');
const authRouter = require('./routers/authRouter');

app.use(cors({
    origin: '*', // toutes les origines
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
app.use(helmet())
app.use(cookieParser())



//Connexion à mongoose
mongoose.connect(process.env.MONGO_URI).then( ()=>{
    console.log('Connexion à la base de données réussie')
}).catch(error => {
    console.log(error)
}
)

//comprendre que nous utilisons des données json
app.use(express.json());

//Middleware pour parser les requêtes POST avec des données de formulaire
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use('/api/auth', authRouter);

app.get('/', (req, res) => { 
    res.json({message:"Hello from the server"});

});


app.listen(process.env.PORT, ()=> { 
    console.log(`Server is running on port ${process.env.PORT}`)
}) ;