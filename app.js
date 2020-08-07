require('dotenv').config()

const express    = require('express'),
      app        = express(),
      bodyParser = require('body-parser'),
      mongoose   = require('mongoose'),
      flash      = require('connect-flash'),
      passport   = require('passport'),
      LocalStrategy = require('passport-local'),
      methodOverride = require('method-override'),
      Campground = require('./models/campground'),
      Comment    = require('./models/comment'),
      User       = require('./models/user'),
      seedDB     = require('./seeds')

// requiring routes
const commentRoutes     = require('./routes/comments'),
      campgroundRoutes  = require('./routes/campgrounds'),
      indexRoutes        = require('./routes/index')

// mongoose.connect('mongodb://localhost:27017/yelpcamp', {
mongoose.connect(`mongodb+srv://arcdev:${process.env.MONGOPW}@cluster0.428kl.mongodb.net/yelpcamp?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to db')
}).catch(err => {
  console.log(`Error with db: ${err}`)
})

// seedDB() // seed the database
app.use(flash())
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(`${__dirname}/public`))
app.use(methodOverride('_method'))
app.locals.moment = require('moment')

// Passport Configuration
app.use(require('express-session')({
  secret: 'but the coffee in peru is much hotter',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// calls this function on every route
app.use((req, res, next)=> {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  next()
})

app.use('/', indexRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/comments', commentRoutes)

// Start App
app.listen(process.env.PORT || 3000, ()=>{
  console.log('YelpCamp Server has started http://localhost:3000')
})