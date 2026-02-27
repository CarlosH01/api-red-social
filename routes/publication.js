const express=require("express");
const router= express.Router();
const PublicationController=require("../controllers/publication");
const { model } = require("mongoose");
const multer = require("multer")

//servicio middleware
const check=require("../middlewares/auth")
//configuracioin de subida
const storage= multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null,("./uploads/publications"))
    },
    filename:(req, file, cb)=>{
        cb(null,"pub-"+Date.now()+"-"+file.originalname)
    }
})
const uploads = multer({storage});
//definir rutas
router.get("/prueba_publication", PublicationController.pruebaPublication)
router.post("/save",check.auth,PublicationController.save)
router.get("/detail/:id",check.auth,PublicationController.detail)
router.delete("/remove/:id",check.auth, PublicationController.removepost)
router.get("/user/:id{/:page}",check.auth,PublicationController.user)
router.post("/upload/:id", [check.auth,uploads.single("file0")],PublicationController.upload);
router.get("/media/:file", PublicationController.media)
router.get("/feed{/:page}",check.auth, PublicationController.feed)

//exportar router
module.exports=router;