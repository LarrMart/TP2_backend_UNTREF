const { MongoClient } = require('mongodb');
const URI             = process.env.MONGODB_URLSTRING;
const client          = new MongoClient(URI);

const connect = async () => {
	try {
		await client.connect();
		console.log('Conectado a la base de datos');
		return client;
	} catch(error) {
		console.log('Error al conectar con la base de datos', error);
		return null;
	}
}

const disconnect = async () => {
	try {
		await client.close();
		console.log('Desconectado de la base de datos');
	} catch(error) {
		console.log('Error al desconectar de la base de datos', error);
	}
}

module.exports = {connect, disconnect};



