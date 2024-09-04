import express from "express";
import anichinRoute from "./api/anichin/routes.js";
import instagramRoute from "./api/IGDOwnloader/routes.js";

const app = express();
const port = 3000;

app.use("/anichin", anichinRoute);
app.use("/instagram", instagramRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
