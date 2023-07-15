const vegetableShopRoutes = require("./routes/vegetableShop.routes.js");
const express = require("express");
const PORT    = process.env.PORT || 3000;
const app     = express();

app.use(express.json());
app.use(vegetableShopRoutes.router);
app.all("*", (req, res) => res.status(404).send("Resourse not found"));
app.listen(PORT, () => console.log(`Server online on port ${PORT}.`));