//imports express, cors, mongodb as mongoose
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { reset } = require("nodemon");
const dotenv = require("dotenv").config();
const Stripe = require("stripe");
const path = require('path');
const fs = require('fs');

//express api
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8000;




// Read the CA certificate file

const dbURI = 'mongodb://username:password@your.mongodb.uri.com/yourDatabase?tls=true';

// Path to your RSA private key file
const keyFilePath = 'C:\Users\Abhishek.Patil\Downloads\abhikey.pem';

// Read the RSA private key from the file
const rsaPrivateKey = fs.readFileSync(keyFilePath, 'utf8');

// Set up the Mongoose connection options
const options = {
  tls: true,
  tlsCAFile: rsaPrivateKey, // Use the private key in the connection options
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to MongoDB using Mongoose
mongoose.connect(dbURI, options)
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((error) => {
    console.error('Error in connection to Database:', error);
    process.exit(1); // Exit the application if the connection fails
  });
//Schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

//model
const userModel = mongoose.model("user", userSchema);
//fetch javascript api
app.get("/", (req, res) => {
  res.send("Server is running");
});
// signup api
app.post("/signup", async (req, res) => {
  //check if email is already in database or new email
  const { email } = req.body;

  const result = await userModel.findOne({ email: email }).exec();
  if (result) {
    res.send({ message: "Email already registered", alert: false });
  } else {
    const data = userModel(req.body);
    const save = await data.save();
    res.send({ message: "Signed up successfully", alert: true });
  }
});

//login api
app.post("/login", async (req, res) => {
  const { email } = req.body;
  const result = await userModel.findOne({ email: email }).exec();
  if (result) {
    const dataSend = {
      _id: result._id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      image: result.image,
    };
    res.send({ message: "login is successful", alert: true, data: dataSend });
  } else {
    res.send({
      message: "Email is not registered/Please signup",
      alert: false,
    });
  }
});

//new product section
const schemaProduct = mongoose.Schema({
  name: String,
  category:String,
  image: String,
  price: String,
  description: String,
});

const productModel = mongoose.model("product", schemaProduct);

//save product in database
app.post("/uploadProduct", async(req, res) => {
  const data = await productModel(req.body)
  const datasave = await data.save()

  res.send({ message: "Upload successfully" });
});

//products api
app.get("/product", async(req, res) => {
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
})

//payment-gateway api
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
// app.post("/payment", async(req,res)=>{
//   //console.log(req.body)
//   try {
//   const params = {
//     submit_type : 'pay',
//     mode : "payment",
//     payment_method_types : ['card'],
//     billing_address_collection: "auto",
//     shipping_options : [{shipping_rate : "shr_1NVApEHeneEHcTX4Nx9tRyDU"}],

//     line_items : req.body.map((item)=>{
//     return{
//         price_data : {
//         currency : "usd",
//         product_data : {
//         name : item.name,
//         },
//         unit_amount : item.price * 100,
//       },
//       adjustable_quantity : {
//         enabled : true,
//         minimum : 1,
//       },
//       quantity : item.qty
//     }
//   }),
//   success_url : `${process.env.FRONTEND_URL}/success`,
//   cancel_url : `${process.env.FRONTEND_URL}/cancel`,
//   }
//   const session = await stripe.checkout.sessions.create(params)
//   res.status(200).json(session.id)
//   }
//   catch (error) {
//     res.status(error.statusCode || 500).json(error.message)
//   }
// })


app.listen(PORT, () => console.log("Server is running at port : " + PORT));
