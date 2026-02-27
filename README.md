Desarrollo de una API REST para una red social construida con Node.js, Express y MongoDb.
El sistema permite el registro y autenticación de usuarios, gestión de perfiles, seguimiento entre usuarios (seguir y dejar de seguir), así como la creación, edición y eliminación de publicaciones.

La API maneja relaciones entre usuarios y publicaciones, aplicando buenas prácticas en estructura de rutas, controladores y middlewares para la gestión de autenticación y autorización.

Para lanzar el servidor: npm start

Users
Ruta registro de usuarios, los datos se deben de enviar por body, con los campos: name, surname, nick, email, password
http://localhost:3900/api/user/register

Login: en login se debe de ingresar el email y password y se le proposionara un token para poder acceder a las demas rutas, debe de enviarse por header y en el campo de authorization
http://localhost:3900/api/user/login

Ruta para ver el perfil de un usuario
http://localhost:3900/api/user/profile/id

Actualizar usuario, debe de poner el token
http://localhost:3900/api/user/update

Agregar una foto de perfil, se debe de enviar con la key "file0" en form-data
http://localhost:3900/api/user/upload

Follow
para seguir un usuario se debe de colocar el token del usuariop y luego el id del usuario que se quiere seguir con el nombre "followed" en el body
http://localhost:3900/api/follow/save

dejar de seguir a un usuario, este es un metodo delete, se debe de agregar el token
http://localhost:3900/api/follow/unfollow/idFollowed

Para ver las personas que sigo, se necesita el,token, mi id y el numero de pagina
http://localhost:3900/api/follow/following{/:id}{/:page}

Para ver las personas que me siguen se necesita el token, mi id y el  numero de pagina
http://localhost:3900/api/follow/followers{/:id}{/:page}

Publication
Para guardar una publicacion solo se necesita el token y el campo "text" en body
http://localhost:3900/api/publication/save

Para ver todas las publicaciones de un usuario se necesita el token y el id del usuario
http://localhost:3900/api/publication/user/id

Para ver todas mis publicaiones solo se necesita el token y numero de pagina
http://localhost:3900/api/publication/feed/1

Para ver una publicacion en especifico, se necesita el token y el id de la publicacion
http://localhost:3900/api/publication/detail/id

Para subir una foto a una publicacion se necesita el token(el token debe de ser de la persona que subio la publicaion) y el id de la publicacion a editar
http://localhost:3900/api/publication/upload/

Para busccar una imagen de una publicacion se necesita el token y el nombre del archivo
http://localhost:3900/api/publication/media/:file




