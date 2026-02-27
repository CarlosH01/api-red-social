const validator=require("validator");

const validate=(params)=>{
    // Asegurarnos que cada campo sea string
  const name = params.name || "";
  const surname = params.surname || "";
  const nick = params.nick || "";
  const email = params.email || "";
  const password = params.password || "";
  const bio = params.bio || "";

  // Validaciones
  if (
    validator.isEmpty(name) ||
    !validator.isLength(name, { min: 3 }) ||
    !validator.isAlpha(name, "es-ES")
  ) throw new Error("Nombre no válido");

  if (
    validator.isEmpty(surname) ||
    !validator.isLength(surname, { min: 3 }) ||
    !validator.isAlpha(surname, "es-ES")
  ) throw new Error("Apellido no válido");

  if (validator.isEmpty(nick) || !validator.isLength(nick, { min: 3 }))
    throw new Error("Nick no válido");

  if (validator.isEmpty(email) || !validator.isEmail(email))
    throw new Error("Email no válido");

  if (validator.isEmpty(password) || !validator.isLength(password, { min: 8 }))
    throw new Error("Contraseña no válida");

  if (bio && !validator.isLength(bio, { max: 255 }))
    throw new Error("Bio demasiado larga");

  console.log("Validación superada");
}
module.exports=validate
