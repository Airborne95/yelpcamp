const express    = require('express'),
      app        = express(),
      bodyParser = require('body-parser'),
      mongoose   = require('mongoose'),
      passport   = require('passport'),
      LocalStrategy = require('passport-local')
      Campground = require('./models/campground'),
      Comment    = require('./models/comment'),
      User       = require('./models/user')
      seedDB     = require('./seeds')

mongoose.connect('mongodb://localhost:27017/yelpcamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch((err)=>{ console.log(`Error with db: ${err}`)})

seedDB() // TODO see if needed
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
app.use(express.static(`${__dirname}/public`))

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
  next()
})

// ======================================================
//                       Get Routes
// ======================================================
app.get('/', (req, res)=>{
  res.render('landing')
})

// INDEX - show all campgrounds
app.get('/campgrounds', (req, res)=>{
  console.log(req.user)
  // Get all campgrounds from DB
  Campground.find({}, (err, allCampgrounds)=>{
    err ? console.log(`Error: ${err}`) : res.render('campgrounds/index', {campgrounds: allCampgrounds})
  })
})

// NEW - show form to create new campground
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

// SHOW - shows more info about one campground
app.get('/campgrounds/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec( (err, foundCampground) => {
    err ? console.log(`error: ${err}`) : res.render('campgrounds/show', {campground: foundCampground})
  })
})

// ======================================================
//                     Comments Routes
// ======================================================

app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res)=>{
  Campground.findById(req.params.id, (err, campground) => {
    err ? console.log(err) : res.render('comments/new', {campground: campground})
  })
})

app.post('/campgrounds/:id/comments', isLoggedIn,(req, res)=>{
  Campground.findById(req.params.id, (err, campground) => {
    if(err){
      console.log(err)
      res.redirect('/campgrounds')
    } else{
      Comment.create(req.body.comment, (err, comment) => {
        if(err){
          console.log(err)
        } else {
          campground.comments.push(comment)
          campground.save()
          res.redirect(`/campgrounds/${campground._id}`)
        }
      })
    }
  })
})

// ======================================================
//                        Post Routes
// ======================================================
// CREATE - add new campground to DB
app.post('/campgrounds', (req, res)=>{
  const name = req.body.name
  const image = req.body.image
  const desc = req.body.description
  const newCampground = {name: name, image: image, description: desc}
  // Create a new campground and save to DB
  Campground.create(newCampground, (err, campground)=>{
    err ? console.log(`Error: ${err}`) : res.redirect('campgrounds')
  })
})

// ======================================================
//                      Auth Routes
// ======================================================
// show register form
app.get('/register', (req, res)=>{
  res.render('register')
})

// handle sign up logic
app.post('/register', (req, res)=>{
  const newUser = new User({username: req.body.username})
  User.register(newUser, req.body.password, (err, user)=>{
    if(err){
      console.log(err)
      return res.render('register')
    }
    passport.authenticate('local')(req, res, ()=>{
      res.redirect('/campgrounds')
    })
  })
})

// show login form
app.get('/login', (req, res)=>{
  res.render('login')
})
// handling login logic
app.post('/login', passport.authenticate('local',{
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}),(req, res)=>{
})

// logout route
app.get('/logout', (req, res)=>{
  req.logout()
  res.redirect('/campgrounds')
})

// Catch all
app.get('*', (req, res)=>{
  res.send('Oops')
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}
// ======================================================
//                        Start App
// ======================================================
app.listen(3000, ()=>{
  console.log('YelpCamp Server has started http://localhost:3000')
})