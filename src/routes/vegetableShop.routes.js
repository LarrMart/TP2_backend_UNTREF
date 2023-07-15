const {Router} = require("express");

const {list, getProductById, getProductsByName,  
	getProductsByCategory, add, update, remove
} = require("../controllers/vegetableShop.controllers.js");

const router = Router();

router.get("/verduleria/listado", list);

router.get("/verduleria/codigo/:codigo", getProductById);

router.get("/verduleria/nombre/:nombre", getProductsByName);

router.get("/verduleria/categoria/:categoria", getProductsByCategory);

router.post("/verduleria/agregar", add);

router.patch("/verduleria/modificar/:codigo", update);

router.delete("/verduleria/eliminar/:codigo", remove);

module.exports = {router};

