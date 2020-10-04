const express = require('express');
const http = require('http');
const morgan=require('morgan')
const bodyParser=require('body-parser')
const dishRouter = require('./Routes/dishRouter');
const promotionsRouter=require('./Routes/PromoRouter')
const leadersRouter=require('./Routes/leaderRouter')
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');
const hostname = 'localhost';
const port = 3000;

const url = 'mongodb://localhost:27017/conFusion';
mongoose.connect(url,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("Connected to the Database");
})
.catch(err => {
    console.log(err);
});


const app = express();
app.use(dishRouter);
app.use(promotionsRouter);
app.use(leadersRouter);
app.use(morgan('dev'));
app.use(bodyParser.json())
const server = http.createServer(app);
app.use(function(err,req,res,next){
  res.locals.message=err.message;
  res.locals.error='development';
  res.status(err.status||500);
  res.render('error');
})
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});