# API RESTFUL 

- [Introducción](#introducción)
- [Configuración de la base datos](#configuración-de-la-base-de-datos)
- [Rutas](#rutas-endpoints)
- [Funcionamiento](#funcionamiento)
    - [Buscar productos por su nombre](#buscar-productos-por-su-nombre)
    - [Buscar productos por su código](#buscar-productos-por-su-código)
    - [Buscar productos por su categoría](#buscar-productos-por-categoría)
    - [Agregar](#agregar-un-producto)
    - [Actualizar](#actualizar-un-producto)
    - [Eliminar](#eliminar-un-producto)

## Introducción

**Fake Company S.A** nos solicitó la creación de un sistema de stock para sus múltiples sucursales de venta de frutas y verduras conocidas como: **mandale-fruta.com**. El propósito de este documento es explicar el funcionamiento de dicho sistema.

## Configuración de la base de datos

Para que la aplicación funcione correctamente se requiere tener una cuenta en MONGODB ATLAS, crear una base de datos con el nombre de **vegetable_shop** y una colección con nombre **products**. Además para configurar un id/código auto incrementable se deben seguir los sig. pasos:

1. Configurar un trigger según se explica en: https://www.mongodb.com/basics/mongodb-auto-increment

2. En la parte de la casilla de la función pegar el sig. código:
   (adaptado para que funcione con este proyecto, difiere con el que aparece en el tutorial)

```js
exports = async function(changeEvent) {
    var docId = changeEvent.fullDocument._id;
    
    const countercollection = context.services.get("introduzca_el_nombre_de_su_cluster").db(changeEvent.ns.db).collection("products_counter");
    const productscollection = context.services.get("introduzca_el_nombre_de_su_cluster").db(changeEvent.ns.db).collection(changeEvent.ns.coll);
    
    var counter = await countercollection.findOneAndUpdate({_id: changeEvent.ns },{ $inc: { seq_value: 1 }}, { returnNewDocument: true, upsert : true});
    var updateRes = await productscollection.updateOne({_id : docId},{ $set : {codigo : counter.seq_value}});
    
    console.log(`Updated ${JSON.stringify(changeEvent.ns)} with counter ${counter.seq_value} result : ${JSON.stringify(updateRes)}`);
};
```

3. Importar el archivo **granjas.json** a la base de datos. (buscarlo **./src/database**)

---

## Rutas (endpoints)

| URL | Método | Descripción |
| -- | :--: | -- | 
| **/verduleria/listado** | GET | El listado de todos los productos | 
| **/verduleria/nombre/:nombre** | GET | [Busca el producto con el nombre proporcionado o los nombres que coicidan con la subcadena](#buscar-productos-por-su-nombre).|
| **/verduleria/codigo/:codigo** | GET | [Busca el producto por su código.](#buscar-productos-por-su-código) |
| **/verduleria/categoria/:categoria**| GET | [Busca los productos según su categoría.](#buscar-productos-por-categoría) |
| **/verduleria/agregar** | POST | [Agrega el producto enviado en el body de la solicitud a la base de datos.](#agregar-un-producto). **No incluir el ID**. |
| **/verduleria/modificar/:codigo** | PATCH | [Actualiza el producto indicado en el código.](#actualizar-un-producto) |
| **/verduleria/eliminar/:codigo** | DELETE | [Elimina el producto indicado en el código](#eliminar-un-producto) |

## Funcionamiento

### _Buscar productos por su nombre_

Si se desea buscar productos por su nombre usuario debe:

1. Escribir la ruta: **/verduleria/nombre/:nombre**, donde :nombre representa el nombre del producto buscado. Utilizando el método HTTP GET.  

Si el nombre indicado se encuentra en la base de datos, se devolverá el producto solicitado, sino se obtendrá un mensaje de error. 

También se acepta que se escriba parte de un nombre, en cuyo caso se devolverá los productos que contengan esa parte del texto buscado.

Ejemplo nº1:
[http://localhost:3008/verduleria/nombre/man](http://localhost:3008/verduleria/nombre/man)  

```json
{
  "result": [
    {
      "_id": "64b17cd95d56155924415e16",
      "nombre": "Manzana",
      "precio": 999.777,
      "categoria": "Fruta",
      "codigo": 1
    },
    {
      "_id": "64b17cd95d56155924415e1d",
      "nombre": "Mango",
      "precio": 2.99,
      "categoria": "Fruta",
      "codigo": 8
    },
    {
      "_id": "64b17cd95d56155924415e23",
      "nombre": "Mandarina",
      "precio": 1.29,
      "categoria": "Fruta",
      "codigo": 14
    }
  ],
  "status": 200,
  "description": "Productos que coinciden con ese nombre."
}
``` 
Cabe destacar que la ruta **NO** hace distinción entre mayúsculas y minúsculas, así, por ejemplo, introduciendo la cadena MAN, mAn, y maN se obtendrán los mismos resultados.

> [http://localhost:3008/verduleria/nombre/MAN](http://localhost:3008/verduleria/nombre/MAN)
> [http://localhost:3008/verduleria/nombre/mAn](http://localhost:3008/verduleria/nombre/MAN)
> [http://localhost:3008/verduleria/nombre/maN](http://localhost:3008/verduleria/nombre/MAN)   

Y tampoco distingue entre vocales con tilde o sin ella.

> [http://localhost:3008/verduleria/nombre/lón](http://localhost:3008/verduleria/nombre/lón)
> [http://localhost:3008/verduleria/nombre/lon](http://localhost:3008/verduleria/nombre/lon)
> [http://localhost:3008/verduleria/nombre/ía](http://localhost:3008/verduleria/nombre/ia)
> [http://localhost:3008/verduleria/nombre/ia](http://localhost:3008/verduleria/nombre/ia)

### _Buscar productos por su código_

Para poder buscar por código de producto, este debe ser escrito como parámetro en la URL, por ejemplo:

> [http://localhost:3008/verduleria/codigo/3](http://localhost:3008/verduleria/codigo/3)

```json
{
  "result": [
    {
      "_id": "64b17cd95d56155924415e18",
      "nombre": "Banana",
      "precio": 0.99,
      "categoria": "Fruta",
      "codigo": 3
    }
  ],
  "status": 200,
  "description": "Se encontró el producto con el código proporcionado."
}
```

#### Error de código en la solicitud
En caso de que el código sea un número no positivo o una cadena 
:

> [http://localhost:3008/verduleria/codigo/-12](http://localhost:3008/verduleria/codigo/-12)
> [http://localhost:3008/verduleria/codigo/0](http://localhost:3008/verduleria/codigo/0)
> [http://localhost:3008/verduleria/codigo/texto](http://localhost:3008/verduleria/codigo/texto)

Se obtiene:

```json
{
  "result": "error",
  "status": 400,
  "description": "El id tiene que ser un número entero positivo."
}
```

### _Buscar productos por categoría_

De forma similar se puede buscar por categoría. Las únicas disponibles son dos: _fruta_ y _verdura_, cualquier otra categoría genera un mensaje de error. Esta debe ser escrita como parámetro en la URL, por ejemplo:

> [http://localhost:3008/verduleria/categoria/fruta](http://localhost:3008/verduleria/categoria/fruta)
> [http://localhost:3008/verduleria/categoria/verdura](http://localhost:3008/verduleria/categoria/verdura)

```json
{
 "result": [
    {
      "_id": "64b17cd95d56155924415e16",
      "nombre": "Manzana",
      "precio": 999.777,
      "categoria": "Fruta",
      "codigo": 1
    },
    {
      "_id": "64b17cd95d56155924415e17",
      "nombre": "Naranja",
      "precio": 1.49,
      "categoria": "Fruta",
      "codigo": 2
    },
    {
      "_id": "64b17cd95d56155924415e18",
      "nombre": "Banana",
      "precio": 0.99,
      "categoria": "Fruta",
      "codigo": 3
    },
    ....
    .....
    .....
    ......
    {
      "_id": "64b17cd95d56155924415e28",
      "nombre": "Ciruela",
      "precio": 1.99,
      "categoria": "Fruta",
      "codigo": 19
    }
 ],
  "status": 200,
  "description": "Productos que coinciden con esa categoría."
}

```

```json
{
  "result": [
    {
      "_id": "64b17cd95d56155924415e29",
      "nombre": "Acelga",
      "precio": 1.99,
      "categoria": "Verdura",
      "codigo": 20
    },
    {
      "_id": "64b17cd95d56155924415e2a",
      "nombre": "Zanahoria",
      "precio": 0.99,
      "categoria": "Verdura",
      "codigo": 21
    },
    {
      "_id": "64b17cd95d56155924415e2b",
      "nombre": "Lechuga",
      "precio": 1.29,
      "categoria": "Verdura",
      "codigo": 22
    },
    ....
    ....
    ....
    ....
],
  "status": 200,
  "description": "Productos que coinciden con esa categoría."
}
```

Al igual que con otras rutas no se hace distinción entre mayúsculas y minúsculas.

> [http://localhost:3008/verduleria/categoria/FrUtA](http://localhost:3008/verduleria/categoria/FrUtA)
> [http://localhost:3008/verduleria/categoria/vERdura](http://localhost:3008/verduleria/categoria/vERdura)

Cualquier otro texto que no sea fruta o verdura, genera un mensaje de error. 

> [http://localhost:3008/verduleria/categoria/especias](http://localhost:3008/verduleria/categoria/especias)
> [http://localhost:3008/verduleria/categoria/hongos](http://localhost:3008/verduleria/categoria/hongos)

```json
{
  "result": "error",
  "status": 400,
  "description": "La categoría especificada no existe."
}
```

### _Agregar un producto_

Para agregar un producto en el sistema, este debe enviarse en el cuerpo de la solicitud de un objeto JSON, con esta y solo esta estructura:
```json
{
  "nombre": "cebolLa",
  "precio": 5.2,
  "categoria": "veRDura"
}
```
Los valores del nombre y la categoría pueden ser enviados con mayúsculas y minúsculas combinadas de distinta manera, pero la aplicación se encarga de formatearlas con la primera letra en mayúsculas y todas las demás en minúsculas. Además se le asignará un código único automáticamente.
El objeto JSON anterior ingresará al sistema así:
```json
{
  "nombre": "Cebolla",
  "precio": 5.2,
  "categoria": "Verdura",
  "codigo": 18
}
```
#### Errores en el cuerpo de la solicitud
Anteriormente fue mencionado que si no se respeta la estructura, se obtiene un mensaje de error, pero, ¿qué significa no respetar la estructura? Son varios los casos en los que puede darse este escenario:

1. Enviar un objeto vacío.
2. Enviar un objeto con claves que no son las que la aplicación espera.
3. Enviar un objeto con las claves requeridas, pero en distinto orden.
4. Enviar un objeto con las claves requeridas, y una/varias clave/s adicional/es.

De cumplirse uno de estos casos, se obtiene el sig. mensaje de error:

```json
{
  "result": "error",
  "status": 400,
  "description": "Formatee correctamente los datos. Ejemplo {\"nombre\": \"boniato\", \"precio\": 0.58, \"categoria\": \"verdura\"}"
}
```
Por último, puede ocurrir que el producto esté formateado correctamente pero ya esté en la base de datos, de suceder este caso, se obtendrá: 

```json
{
  "result": "error",
  "status": 409,
  "description": "Este producto ya existe en la base de datos."
}
```

### _Actualizar un producto_

Para realizar la actualización de un producto el usuario debe:

1. Escribir la ruta: **/verduleria/modificar/:codigo**, donde código representa el id del producto buscado. Utilizando el método HTTP PATCH.  

2. Incluir en el cuerpo de la solicitud un objeto JSON con esta y solo esta estructura:

```json
{
  "precio": 0.999999999
}
```
Si el código indicado se encuentra en la base de datos, el producto se actualizará, sino se obtendrá un mensaje de error.


**Ejemplo nº1: una solicitud PATCH a la ruta:**
> **/verduleria/modificar/1**

Se obtendrá: 

```json
{
  "result": {
    "_id": "64b17cd95d56155924415e16",
    "nombre": "Manzana",
    "precio": 0.999999999,
    "categoria": "Fruta",
    "codigo": 1
  },
  "status": 200,
  "description": "Producto actualizado correctamente."
}
```

**Ejemplo nº2: una solicitud PATCH a la ruta:**
> **/verduleria/modificar/100000**


```json
{
  "result": "error",
  "status": 404,
  "description": "No se encontró ningún producto con el código indicado."
}
```

#### Errores en la solicitud de actualización

El manejo de  errores en la solicitud de actualización funciona de manera análoga a lo explicado en los apartados anteriores.

1. El código enviado es NO positivo o texto. [*](#error-de-código-en-la-solicitud)

2. El objeto se envía con claves distintas a las esperadas. [*](#errores-en-el-cuerpo-de-la-solicitud)




### _Eliminar un producto_

Para realizar la eliminación de un producto el usuario debe:

1. Escribir la ruta: **/verduleria/eliminar/:codigo**, donde código representa el id del producto buscado. Utilizando el método HTTP DELETE.  

Si el código indicado se encuentra en la base de datos, el producto se eliminará, sino se obtendrá un mensaje de error.


**Ejemplo nº1: una solicitud DELETE a la ruta:**
> **/verduleria/eliminar/39**

Se obtendrá: 

```json
{
  "result": {
    "_id": "64b45a2ab5dbef679792c941",
    "nombre": "Apio",
    "precio": 1000,
    "categoria": "Verdura",
    "codigo": 39
  },
  "status": 200,
  "description": "Producto eliminado correctamente."
}
```

**Ejemplo nº2: una solicitud DELETE a la ruta:**
> **/verduleria/eliminar/100000**


```json
{
  "result": "error",
  "status": 404,
  "description": "No se encontró ningún producto con el código indicado."
}
```

#### ___Errores en la solicitud de eliminación___

El manejo de  errores en la solicitud de eliminación  funciona de manera análoga a lo explicado en los apartados anteriores.

1. El código enviado es NO positivo o texto. [*](#error-de-código-en-la-solicitud)






