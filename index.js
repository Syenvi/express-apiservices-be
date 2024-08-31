import express from "express";
import router from "./api/anichin/routes.js";

const app = express();
const port = 3000;

app.use("/anichin", router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
