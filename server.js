const express = require("express");
const mongoose = require("mongoose");
const Task = require("./model");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
mongoose.set("strictQuery", false);

mongoose
  .connect(
    "mongodb+srv://mukeshreddy:mukeshreddy@cluster0.a2qya7x.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("Db Connected"));
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);
app.listen(3001, () => console.log("Server Running at https://localhost:3001"));

app.post("/register", async (request, response) => {
  const { name, mobile, email, password } = request.body;
  try {
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    let exist = await Task.findOne({ email });
    if (exist) {
      return response.status(400).send("User Already Exists");
    }
    // if (password !== conformedPassword) {
    //  return response.status(400).send("Password are not matching")
    //}
    let newUser = new Task({
      name: name,
      mobile: mobile,
      email: email,
      password: password,
    });
    await newUser.save();
    return response.json(await Task.find());
  } catch (error) {
    return response.send("Internal Error");
  }
});

app.get("/", async (request, response) => {
  try {
    return response.json(await Task.find());
  } catch (error) {
    console.log(error);
  }
});

app.delete("/delete/:id", async (request, response) => {
  try {
    return response.json(await Task.findByIdAndDelete(request.params.id));
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (request, response) => {
  try {
    const { email, password } = req.body;
    let exist = await Task.findOne({ email });
    if (!exist) {
      return res.status(400).send("User Not Found");
    }
    if (exist.password !== password) {
      return res.status(400).send("Invalid credentials");
    }
    let payload = {
      user: {
        id: exist.id,
      },
    };
    jwt.sign(payload, "jwtSecret", { expiresIn: 3600000 }, (err, token) => {
      if (err) throw err;
      return response.json({ token });
    });
  } catch (err) {
    console.log(err);
    return response.status(500).send("Server Error");
  }
});
