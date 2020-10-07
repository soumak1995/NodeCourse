const express = require('express');
const http = require('http');
const morgan=require('morgan')
const bodyParser=require('body-parser')
const dishRouter = require('./Routes/dishRouter');
const promotionsRouter=require('./Routes/PromoRouter')
const leadersRouter=require('./Routes/leaderRouter')
var indexRouter = require('./Routes/index');
var usersRouter = require('./Routes/users');
const mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var authenticate = require('./authenticate');
const Dishes = require('./models/dishes');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
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
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-67890-09876-54321'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));
app.use(indexRouter);
app.use(usersRouter);
function auth (req, res, next) {
  console.log(req.user);

  if (!req.user) {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    next(err);
  }
  else {
        next();
  }
}
app.use(auth);
app.use(dishRouter);
app.use(promotionsRouter);
app.use(leadersRouter);
app.use(function(req, res, next) {
  next(createError(404));
});
const server = http.createServer(app);
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});