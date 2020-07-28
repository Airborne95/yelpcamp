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
// ======================================================
//                       Get Routes
// ======================================================
app.get('/', (req, res)=>{
  res.render('landing')
})

// INDEX - show all campgrounds
app.get('/campgrounds', (req, res)=>{
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

app.get('/campgrounds/:id/comments/new', (req, res)=>{
  Campground.findById(req.params.id, (err, campground) => {
    err ? console.log(err) : res.render('comments/new', {campground: campground})
  })
})

app.post('/campgrounds/:id/comments', (req, res)=>{
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

app.get('*', (req, res)=>{
  res.send('Oops')
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
//                        Start App
// ======================================================
app.listen(3000, ()=>{
  console.log('YelpCamp Server has started http://localhost:3000')
})