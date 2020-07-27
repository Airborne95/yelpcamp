const express    = require('express'),
      app        = express(),
      bodyParser = require('body-parser'),
      mongoose   = require('mongoose'),
      Campground = require('./models/campground'),
      seedDB     = require('./seeds')


mongoose.connect('mongodb://localhost:27017/yelpcamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch((err)=>{ console.log(`Error with db: ${err}`)})

seedDB() // TODO see if needed
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
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
    err ? console.log(`Error: ${err}`) : res.render('index', {campgrounds: allCampgrounds})
  })
})

// NEW - show form to create new campground
app.get('/campgrounds/new', (req, res) => {
  res.render('new')
})

// SHOW - shows more info about one campground
app.get('/campgrounds/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec( (err, foundCampground) => {
    err ? console.log(`error: ${err}`) : res.render('show', {campground: foundCampground})
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