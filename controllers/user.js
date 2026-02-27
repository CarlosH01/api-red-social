//dependencias y modulos
const User = require("../models/user");
const publication=require("../models/publication")
const Follow=require("../models/follow")
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-pagination");
const fs =require("fs")
const path=require("path")
//import service
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const follow = require("../models/follow");
const validate=require("../helpers/validate")
//acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).json({
    mensage: "mensaje enviado",
  });
};

//registro  de usuarios
const register = async (req, res) => {
  try {
    //recoger datos de la peticion
    let params = req.body;

    //comprobar que llegan bien
    if (!params.name || !params.email || !params.password || !params.nick) {
      return res.status(400).json({
        status: "error",
        message: "Faltan datos por enviar",
      });
    }
    //validacion
    validate(params)

    //control de usuarios duplicados
    const users = await User.find({
      $or: [
        { email: params.email.toLowerCase() },
        { nick: params.nick.toLowerCase() },
      ],
    });

    if (users && users.length >= 1) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe",
      });
    }
    //cifrar la password
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;
    //crear objeto de usuario
    let user_to_save = new User(params);

    //guardar rn db
    const userStored = await user_to_save.save();
    return res.status(200).json({
      status: "success",
      message: "Accion de resgistro de usuarios",
      user: userStored,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Error en el registro del usuario",
      error
    });
  }
};
const login = async (req, res) => {
  try {
    //recoger parametros
    let params = req.body;
    if (!params.email || !params.password) {
      return res.status(400).send({
        status: "error",
        message: "Faltan datos por enviar",
      });
    }
    //buscar en la base de datos si existe
    const user = await User.findOne({ email: params.email }); 
    if (!user) {
      return res.status(400).send({
        status: "error",
        message: "No existe el usuario",
      });
    }

    //comprobar datos
    let pwd = bcrypt.compareSync(params.password, user.password);

    if (!pwd) {
      return res.status(400).send({
        status: "error",
        message: "Datos erroneos",
      });
    }

    //token
    const token = jwt.createToken(user);
    //datos del usuario
    return res.status(200).send({
      status: "success",
      message: "Incio de sesion exitoso",
      user: {
        id: user._id,
        name: user.name,
        nick: user.nick,
      },
      token,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "Error en el servidor",
    });
  }
};

const profile = async (req, res) => {

  try {
    
    //recibir el parametro de id de usuario por la url
    const id = req.params.id;
  
    //consulta para sacar los datos del usuario
    const user = await User.findById(id).select({ password: 0, role: 0 });
    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "El usuario no existe o hay un error",
      });
    }
    //info de seguimiento
    const followInfo= await followService.followThisUser(req.user.id,id)
  
    //devolver el resultado
    return res.status(200).send({
      status: "success",
      user: user,
      following:followInfo.following,
      follower: followInfo.follower
    });
  } catch (error) {
     return res.status(404).send({
        status: "error",
        message: "error en el servidor",
      });
  }
};

const list = async (req, res) => {

  try {
    //controlar en que pagina estamos
    let page = 1;
    if (req.params.page) {
      page = req.params.page;
    }
    page = parseInt(page);
    //consulta con mongoose paginate
    let itemsPerPage = 5;
  
    const list = await User.find().select("-password -email -role  -__v").sort("_id").paginate(page, itemsPerPage);
    const total = await User.countDocuments();
    if (!list) {
      return res.status(400).send({
        status: "error",
        message: "Error en la consulta",
      });
    }
    //sacar un array de ids de los usuarios que me siguen y los que sigo
    let followUserIds= await followService.followUserIds(req.user.id)
    //devolver resultado
  
    return res.status(200).send({
      status: "success",
      list,
      page,
      itemsPerPage,
      total,
      pages: Math.ceil(list / itemsPerPage),
      user_following:followUserIds.following,
      user_follow_me: followUserIds.followers
    });
  } catch (error) {
     return res.status(404).send({
        status: "error",
        message: "error en el servidor",
      });
  }
};

const update = async (req, res) => {

  try {
    //recoger info del usuario a actualizar
    let userToIdentity = req.user;
    let userToUpdate = req.body;
    //eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;
    //compronar si el usuario existe
    const users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });
  
    let userIsset = false;
    users.forEach((user) => {
      if (user && user._id.toString() !== userToIdentity.id.toString())
        userIsset = true;
    });
  
    if (userIsset) {
      return res.status(200).send({
        status: "success",
        message: "El usuario ya existe",
      });
    }
  
    //cifrar la password
    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    }
    else{
      delete userToUpdate.password;
    }
  
    //buscar y actualizar
    const actualizar = await User.findByIdAndUpdate({_id:
      userToIdentity.id},
      userToUpdate,
      { new: true }
    );
    if (!actualizar) {
      return res.status(500).send({
        status: "error",
        message: "error al actualizar el usuario",
      });
    }
    //resuesta
    return res.status(200).send({
      status: "success",
      message: "usuario actualizado",
      user: actualizar,
    });
  } catch (error) {
     return res.status(500).send({
        status: "error",
        message: "error en el servidor",
      });
  }
};

const upload= async (req, res)=>{
  try {
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
    const updateImage= await User.findOneAndUpdate({_id:req.user.id},{image:req.file.filename}, {new:true})
  if(!updateImage){
     return res.status(500).send({
        status: "error",
        message: "error en la subida del avatar",
      });
  }
  
    //devolver respuesta
     return res.status(200).send({
        status: "success",
        user:updateImage,
        file:req.file,
    
        
      });
  } catch (error) {
     return res.status(500).send({
        status: "error",
        message: "error en el servidor1",
      });
  }
}

const avatar=(req, res)=>{
  //sacar el parametro de la url
  const file = req.params.file;
  //montar el path real de la imagen
  const filePath= "./uploads/avatar/"+file;
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
const counters= async(req, res)=>{
  let userId=req.user.id;

  if(req.params.id){
    userId=req.params.id;
  }
  try {
    const following=await Follow.countDocuments({"user":userId});
    const followed=await Follow.countDocuments({"followed":userId});
    const publications= await publication.countDocuments({"user":userId})

    return res.status(200).send({
      userId,
      following:following,
      followed: followed,
      publications:publications
    })
  } catch (error) {
    return res.status(500).send({
        status: "error",
        message: "error en el servidor",
      });
  }
}

//exportar acciones
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counters
};
