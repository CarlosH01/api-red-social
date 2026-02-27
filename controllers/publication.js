//dependencias
const fs =require("fs")
const path=require("path")
//modelo
const publication=require("../models/publication")
//servicios
const followService=require("../services/followService")
//acciones de prueba
const pruebaPublication= (req, res)=>{
    return res.status(200).json({
        mensage:"mensaje enviado"
    })
}
//guardar una publicacion
const save= async(req,res)=>{

    //recoger datos del body
    const params=req.body;
    //si no llegan dar respuesta
    if(!params)return res.status(400).send({status:"error", message:"debes enviar el texto de la publicacion"})
    //crear y rellenar el objeto del modelo
    let newPublication= new publication(params);
    newPublication.user=req.user.id;
    //guardar objeto en bbdd
    const newPost= await newPublication.save();
    if(!newPost)return res.status(400).send({status:"error", message:"No se a guardado la publicacion"})
    return res.status(200).send({
        status:"success",
        message:"Publicaion guardada",
        newPost
    })
}
//sacar una publicacion
const detail= async(req, res)=>{
//sacar id de publicacion
    const publicationId=req.params.id;
//sacar find de id
const viewPost= await publication.findById(publicationId)
if(!viewPost)return res.status(400).send({status:"error", message:"Error al mostrar publicacion"})
//devolver respuesta

    return res.status(200).send({
        status:"success",
        message:"Esta es una publicacion",
        viewPost
    })
}
//eliminar publicaciones
const removepost= async(req,res)=>{
//sacar id de publicacion
    const publicationId=req.params.id;

    //find y remove
    const remove= await publication.find({"user":req.user.id, "_id":publicationId}).deleteOne()

    if(!remove)return res.status(400).send({status:"error", message:"Esta publicacion no existe"})
    //respuesta

    return res.status(200).send({
        status:"success",
        message:"Esta publicacion ha sido eleminada",
        remove
    })
}
//listar todas las publicaciones
const user=async(req,res)=>{

    //sacr el id de usuario
    let userId=req.params.id;
    //controlar la pagina
    let page=1;
    
    if(req.params.page)page= req.params.page

    const itemsPerPage= 5;
    //find, populate, ordenar, paginar
    const postUser = await publication.find({user:userId}).sort("-create_at").populate('user','-password -__v -role').paginate(page,itemsPerPage)
    const total = await publication.countDocuments({user:userId});
    if(!postUser || postUser.length<=0 ){
        return res.status(404).send({
        status:"error",
        message:"No hay publicaciones para mostrar",
       postUser
    })
    }

    return res.status(200).send({
        status:"success",
        message:"Son todas las publicaciones de este usuario",
        postUser,
        total,
        pages:Math.ceil(total/itemsPerPage),
        page
    })
}
//subir ficheros
const upload= async (req, res)=>{


  try {
    //sacar publication id
    const publicationId =req.params.id;
    //recoger el fichero de imagen y comprobar que existe
    if(!req.file){
      return res.status(404).send({
        status: "error",
        message: "no llega el fichero ",
      });
    }
    //conseguir el nombre de archivo
    let image = req.file.originalname;
    //sacar la extension del archivo
    const imageSplit= image.split("\.");
    const extension= imageSplit[1];
    //comprobar extension
    if(extension !="png" && extension !="jpg" && extension !="jpeg" && extension !="gif"){
      //borrar archivo subido
      const filePath =req.file.path;
      const fileDeleted=fs.unlinkSync(filePath)
       return res.status(400).send({
        status: "error",
        message: "extension del fichero invalida ",
      });
    }
  
    //si es correcta, guardar imagen
   
    const updatePublication= await publication.findOneAndUpdate({"user":req.user.id, "_id":publicationId},{file:req.file.filename}, {new:true}) 
  
  if(!updatePublication){
     return res.status(400).send({
        status: "error",
        message: "error en la subida de la publicacion",
      });
  }
  
    //devolver respuesta
     return res.status(200).send({
        status: "success",
        publication:updatePublication,
        file:req.file,
    
        
      });
  } catch (error) {
     return res.status(500).send({
        status: "error",
        message: "error en el servidor1",
      });
  }
}
//devolver archivos multimedia imagenes
const media=(req, res)=>{
  //sacar el parametro de la url
  const file = req.params.file;
  //montar el path real de la imagen
  const filePath= "./uploads/publications/"+file;
  //comprobar que existe
 fs.stat(filePath, (err, stats) => {
  if (err || !stats) {
    return res.status(404).send({
      status: "error",
      message: "La imagen no existe",
    });
  }
      //devolver el file
    return res.sendFile(path.resolve(filePath))
  })

}
//listar todas las publicaciones(FEED)
const feed=async(req,res)=>{

  //sacar la pagina actual
  let page=1;
  if(req.params.page){
    page=req.params.page;
  }
  //establecer numero de elementos por paginas
  let itemsPerPage=5;
  //sacar array de identificadores de usuarios que sigo
  const myFollow = await followService.followUserIds(req.user.id);
  //find a publicaciones in, ordenar, popular, paginar
  const total = await publication.countDocuments({
        user: { $in: myFollow.following }
    });

    // Paginar correctamente
    const publications = await publication
        .find({ user: { $in: myFollow.following } })
        .populate("user", "-password -role -__v -email")
        .sort("-created_at")
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage);


   return res.status(200).send({
        status:"success",
        message:"Son todas las publicaciones",
        following:myFollow.following,
        total,
        page,
        pages:Math.ceil(total/itemsPerPage),
        publications,

    })
}


//exportar acciones
module.exports={
    pruebaPublication,
    save,
    detail,
    removepost,
    user,
    upload,
    media,
    feed
}