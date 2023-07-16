const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();

const areEquals = (a, b) =>
  a.length === b.length && a.every((element, index) => element === b[index]);

//revisa que el prod. tenga las claves esperadas y en el mismo orden.
const hasCorrectKeys = (mandatoryKeys, prod) => {
	const prodKeys = Object.keys(prod);
	return areEquals(mandatoryKeys, prodKeys);
}

const hasCorrectDataType = prod => 
	typeof prod.nombre === "string" && typeof prod.categoria === "string" 
	&& typeof prod.precio === "number" && prod.precio > 0;
    
module.exports = {capitalize, hasCorrectKeys, hasCorrectDataType};

