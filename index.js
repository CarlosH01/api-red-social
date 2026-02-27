//importar dependencias
const {connection} =require("./database/connection");
const express= require('express');
const cors = require("cors");
//conexion a dba
connection();
//crear servidor
const app = express();
const puerto = 3900;
//configurar cors
app.use(cors());
// convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// cargar las rutas
const UserRoutes= require("./routes/user");
const PublicationRoutes =require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);
//ruta de prueba
app.get("/ruta-prueba",(req, res)=>{
    return res.status(200).json(
       { 
        "id":1,
        "nombre":"Carlos"
       }

    )
})
// poner el servidor a escuchar peticiones http
app.listen(puerto, ()=>{
    console.log("Ya prendio tu!!")
})