const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();

//revisa que el prod. tenga las claves esperadas y en el mismo orden.
const hasCorrectKeys = (mandatoryKeys, prod) => {
	const prodKeys = Object.keys(prod);
	return mandatoryKeys.every((str, index) => str === prodKeys[index]);
}
    
module.exports = {capitalize, hasCorrectKeys};