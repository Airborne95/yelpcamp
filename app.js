const express    = require('express'),
      app        = express(),
      bodyParser = require('body-parser'),
      mongoose   = require('mongoose')

mongoose.connect('mongodb://localhost:27017/yelpcamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch((err)=>{ console.log(`Error with db: ${err}`)})

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
// ======================================================
//                     Schema Setup
// ======================================================
var campgroundSchema = new mongoose.Schema({
  name: String,
  image: String
})

var Campground = mongoose.model('Campground', campgroundSchema)
// ======================================================
//                       Get Routes
// ======================================================
app.get('/', (req, res)=>{
  res.render('landing')
})

app.get('/campgrounds', (req, res)=>{
  // Get all campgrounds from DB
  Campground.find({}, (err, allCampgrounds)=>{
    err ? console.log(`Error: ${err}`) : res.render('campgrounds', {campgrounds: allCampgrounds})
  })
})

app.get('/campgrounds/new', (req, res) => {
  res.render('new')
})

app.get('*', (req, res)=>{
  res.send('Oops')
})
// ======================================================
//                        Post Routes
// ======================================================
app.post('/campgrounds', (req, res)=>{
  const name = req.body.name
  const image = req.body.image
  const newCampground = {name: name, image: image}
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