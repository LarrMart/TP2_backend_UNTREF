function Response(result, status, description) {
	return {
		"result": result,
		"status": status,
		"description": description
	}
}

function responses(str) {
	let ret = undefined;
	switch(str) {
 		case "connectionFailed": 
 			ret = new Response("error", 500,"No fue posible conectarse con la base de datos."); break;

 		case "wrongId": 
 			ret = new Response("error",	400, "El id tiene que ser un número entero positivo."); break;

		case "wrongDataFormat":
			ret = new Response("error",	400, 'Formatee correctamente los datos.'); break;

		case "noMatches":
			ret = new Response("error",	404, "No se encontraron coincidencias."); break;

		case "wrongCategory": 
			ret = new Response("error", 400, "La categoría especificada no existe."); break;

		case "exists": 
			ret = new Response("error", 409, "Este producto ya existe en la base de datos."); break;
	}

 	return ret;
}

module.exports = {responses, Response};





