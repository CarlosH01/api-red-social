const mongoose =require("mongoose");

const connection = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/mi_red_social");

        console.log("Eso compadre!!")
    } catch (error) {
        console.log(error);
        throw new Error("No se a podido conectar a la base de datos");
    }
}

module.exports={
    connection
}