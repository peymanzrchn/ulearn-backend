const path = require("path");

const express = require("express");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const dotEnv = require("dotenv");
const { errorController } = require("./middlewares/errorController");
const { setHeaders } = require("./middlewares/headers");

//config env
dotEnv.config({ path: "./config/config.env" });

//connect to database
connectDB();

const app = express();

//static
app.use(express.static(path.join(__dirname, "public")));

//parser custom-middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(setHeaders);

//upload-file
app.use(fileUpload());

//routes
app.use("/api", require("./routes/main"));
app.use("/users", require("./routes/user"));
app.use("/dashboard", require("./routes/course"));

//Error Controller
app.use(errorController);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running in ${PORT}`));
