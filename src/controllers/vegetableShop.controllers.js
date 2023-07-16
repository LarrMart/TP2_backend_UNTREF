const db_connector = require("../database/database_connector.js");
const {responses, Response} = require("./Response.js");
const {capitalize, hasCorrectKeys, hasCorrectDataType} = require("./utilities.js");

const list = async (req, res) => {
	let ret = undefined;
	try {
		const client = await db_connector.connect();
		const db = client.db("vegetable_shop");
		const products = await db.collection("products").find()
														.sort({codigo: 1})
														.toArray();

		ret = new Response(products, 200, "Listado de todos los productos.");
	} catch(error) {
		ret = responses("connectionFailed");
	} finally {
		await db_connector.disconnect()	;
	}

	res.status(ret.status).json(ret);
}

const getProductById = async (req, res) => {
	let ret = responses("wrongId");
	let id = parseInt(req.params.codigo);
	try {
		if(id && id > 0) {
			const client   = await db_connector.connect();
			const db = client.db("vegetable_shop");
			const products = await db.collection("products").find({"codigo": id}).toArray();
			
			ret = products.length !== 0 ? 
				new Response(products, 200, "Se encontró el producto con el código proporcionado.") : 
				responses("noMatches");			
		}
	} catch(error) {
		ret = responses("connectionFailed");
	} finally {
		await db_connector.disconnect()	;
	}

	res.status(ret.status).json(ret);
}

const getProductsByName = async (req, res) => {
	let name = req.params.nombre;
	let ret = undefined;
	try {
		const client = await db_connector.connect();
		const db = client.db("vegetable_shop");
		const products = await db.collection("products")
								 .find({"nombre": {$regex: name, $options: "i"}})
								 .sort({codigo: 1})
								 .toArray();
		
		ret = products.length !== 0 ? 
			new Response(products, 200, "Productos que coinciden con ese nombre.") : 
			responses("noMatches");	
			
	} catch(error) {
		 ret = responses("connectionFailed");;
	} finally {
		await db_connector.disconnect()	;
	}

	res.status(ret.status).json(ret);
}

const getProductsByCategory = async (req, res) => {
	let category = req.params.categoria;
	let regex = /(Verdura|Fruta)/i;
	let ret = responses("wrongCategory");
	
	if(regex.test(category)) { // Si la categoría es erronea, directamente no busco.
		try {
			const client = await db_connector.connect();
			const db = client.db("vegetable_shop");
			const products = await db.collection("products")
									 .find({"categoria": capitalize(category)})
									 .sort({codigo: 1})
									 .toArray();

			ret = products.length !== 0 ? 
				new Response(products, 200, "Productos que coinciden con esa categoría.") : 
				responses("noMatches");	
		
		} catch(error) {
		 	ret = responses("connectionFailed");
		} finally {
			await db_connector.disconnect()	;
		}
	}
	
	res.status(ret.status).json(ret);
}

const add = async (req, res) => {
	let ret = responses("wrongDataFormat");   //De entrada supongo que la información del body está mal formateada.
	ret.description += ` Ejemplo {"nombre": "batata", "precio": 0.58, "categoria": "verdura"}`
	let prod = req.body;
	let mandatoryKeys = ["nombre", "precio", "categoria"]; 
	
	// Verifico que la información enviada en el body
	// esté correctamente formateada.
	if(hasCorrectKeys(mandatoryKeys, prod)) {        
		if(hasCorrectDataType(prod)) { 
			let regex = /(Verdura|Fruta)/i;		// NO se permite que el usuario pueda crear una nueva categoría									
			if(regex.test(prod.categoria)) {	// ejemplo {"nombre": "orégano", "precio": 1.2, "categoria": "especias"} NO PERMITIDO
				try {									 						
					const client = await db_connector.connect();	
					prod.nombre = capitalize(prod.nombre);          // En la base de datos están guardados con el primer
					prod.categoria = capitalize(prod.categoria);    // carácter en mayúsculas
					const productsCollection = client.db("vegetable_shop").collection("products");
					const search = await productsCollection.find({nombre: prod.nombre}).toArray();

					// Si el prod. NO está en la BD, lo agrego
					if(search.length === 0) {
						await productsCollection.insertOne(prod);
						ret = new Response(prod, 201, "Producto agregado exitósamente.")
					} else {
						ret = responses("exists");
					} 													  
								 
				} catch(error) {
					ret = responses("connectionFailed");
				} finally {
					await db_connector.disconnect();
				}
			}             				
		}
	}

	res.status(ret.status).json(ret);
}

const update = async (req, res) => {
	let id = req.params.codigo;
	let prodToUpdate = req.body;
	let ret = responses("wrongId"); // De entrada supongo que el id es incorrecto.
	try {
		id = parseInt(id);
		if(id && id > 0) {
			let mandatoryKeys = ["precio"];
			if(hasCorrectKeys(mandatoryKeys, prodToUpdate)) { 	// Permite modificar, si se envía el precio únicamente
				if(prodToUpdate.precio > 0) {                    // y, además, este es positivo.
					const client = await db_connector.connect();
					const productsCollection = client.db("vegetable_shop").collection("products");
					const searchForId = await productsCollection.findOneAndUpdate(
					   { codigo: id },
					   { $set: { precio: prodToUpdate.precio } },
					   { returnDocument: "after" }
					   
					);

					if(searchForId.value !== null)
						ret = new Response(searchForId.value, 200, "Producto actualizado correctamente.");
					else
						ret = new Response("error", 404, "No se encontró ningún producto con el código indicado.");
						
					 
				} else {        
					ret = new Response("error", 400, "El precio debe ser un número positivo.");
				}		
			} else {
				ret = responses("wrongDataFormat");
			}
		}
	} catch(error) {
		ret = responses("connectionFailed");
	} finally {
		await db_connector.disconnect();
	}

	res.status(ret.status).json(ret);
}

const remove = async (req, res) => {
	let id = req.params.codigo;
	let ret = responses("wrongId"); // De entrada supongo que el id es incorrecto.
	try {
		id = parseInt(id);
		if(id && id > 0) {	              
			const client = await db_connector.connect();
			const productsCollection = client.db("vegetable_shop").collection("products");
			const searchForId = await productsCollection.findOneAndDelete({ codigo: id });
			
			if(searchForId.value !== null)
				ret = new Response(searchForId.value, 200, "Producto eliminado correctamente.");
			else
				ret = new Response("error", 404, "No se encontró ningún producto con el código indicado.");			 
		}	
	} catch(error) {
		ret = responses("connectionFailed");
	} finally {
		await db_connector.disconnect();
	}

	res.status(ret.status).json(ret);
}

module.exports = {
	list, getProductById, getProductsByName, 
	getProductsByCategory, add, update, remove
}