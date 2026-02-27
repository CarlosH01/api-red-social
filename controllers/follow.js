//importar modelo
const Follow = require("../models/follow");
const User = require("../models/user");
//servicio

const followService = require("../services/followService");
//dependencias
const mongoosePaginate = require("mongoose-pagination");
//acciones de prueba
const pruebaFollow = (req, res) => {
  return res.status(200).json({
    mensage: "mensaje enviado",
  });
};

//accion de follow
const save = async (req, res) => {
  try {
    //conseguir datos por body
    const params = req.body;
    //sacar id del usuario identificado
    const identity = req.user;
    //crear objeto follow
    let userToFollow = new Follow({
      user: identity.id,
      followed: params.followed,
    });
    //guardar objeto en bbdd
    const followStored = await userToFollow.save();
    if (!followStored) {
      return res.status(400).json({
        status: "error",
        message: "error al seguir",
      });
    }
    return res.status(200).json({
      status: "success",
      identity: req.user,
      follow: followStored,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error con el servidor",
    });
  }
};
//dejar de seguir
const unfollow = async (req, res) => {
  //recoger el id usuario identificado
  const userId = req.user.id;
  //id del que sigo
  const followedId = req.params.id;
  //find de las coincidencias y hacer remove
  const unfollowed = await Follow.find({
    user: userId,
    followed: followedId,
  }).deleteOne();

  if (!unfollowed) {
    return res.status(400).json({
      status: "success",
      message: "error al dejar de seguir",
    });
  }

  return res.status(200).json({
    status: "success",
    message: "follow eliminado correctamente",
    identity: req.user,
    unfollowed,
  });
};
//listado de personas que sigo
const following = async (req, res) => {
  //sacar id del usuario identificado
  let userId = req.user.id;
  //comprobar si me llega el id por parametro en url
  if (req.params.id) userId = req.params.id;

  //comprobar si me llega la pagina, si no me llega 1
  let page = 1;

  if (req.params.page) page = req.params.page;

  //usuarios por pagina quiero mostrar
  const itemsPerPage = 5;
  //find a follow, popular datos de los usuarios y paginar con mongoose paginate
  const follows = await Follow.find({ user: userId })
    .populate("user followed", "-password -role -__v -email")
    .paginate(page, itemsPerPage);
  const total = await Follow.countDocuments({user:userId});
  //listado de usuarios

  //sacar un array de ids de los usuarios que me siguen y los que sigo
  let followUserIds = await followService.followUserIds(req.user.id);
  return res.status(200).json({
    status: "success",
    message: "personas que sigues",
    follows,
    total,
    pages: Math.ceil(total / itemsPerPage),
    user_following: followUserIds.following,
    user_follow_me: followUserIds.followers,
  });
};
//listado se personas que me siguen
const followers = async (req, res) => {
  //sacar id del usuario identificado
  let userId = req.user.id;
  //comprobar si me llega el id por parametro en url
  if (req.params.id) userId = req.params.id;

  //comprobar si me llega la pagina, si no me llega 1
  let page = 1;

  if (req.params.page) page = req.params.page;

  //usuarios por pagina quiero mostrar
  const itemsPerPage = 5;

  const follows = await Follow.find({ followed: userId })
    .populate("user followed", "-password -role -__v -email")
    .paginate(page, itemsPerPage);
  const total = await Follow.countDocuments({ followed: userId });
  //sacar un array de ids de los usuarios que me siguen y los que sigo
  let followUserIds = await followService.followUserIds(req.user.id);
  return res.status(200).json({
    status: "success",
    message: "personas que te siguen",
    follows,
    total,
    pages: Math.ceil(total / itemsPerPage),
    user_following: followUserIds.following,
    user_follow_me: followUserIds.followers,
  });
};
//exportar acciones
module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
