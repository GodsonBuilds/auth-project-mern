require('dotenv').config();
const express = require('express');
const  helmet  = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors());
app.use(helmet())
app.use(cookieParser())


//comprendre que nous utilisons des données json
app.use(express.json());

//Middleware pour parser les requêtes POST avec des données de formulaire
app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => { 
    res.json({message:"Hello from the server"});

});


app.listen(process.env.PORT, ()=> { 
    console.log(`Server is running on port ${process.env.PORT}`)
}) ;