const database_connector = require("../database/database_connector.js");

const list = (req, res) => {
	res.send("/verduleria/listado");
}

const getProductById = (req, res) => {
	res.send("/verduleria/codigo/:codigo");
}

const getProductByName = (req, res) => {
	res.send("/verduleria/nombre/:nombre");
}

const getProductByCategory = (req, res) => {
	res.send("/verduleria/categoria/:categoria");
}

const add = (req, res) => {
	res.send("/verduleria/agregar");
}

const update = (req, res) => {
	res.send("/verduleria/modificar/:codigo");
}

const remove = (req, res) => {
	res.send("/verduleria/eliminar/:codigo");
}

module.exports = {
	list, getProductById, getProductByName, 
	getProductByCategory, add, update, remove
}