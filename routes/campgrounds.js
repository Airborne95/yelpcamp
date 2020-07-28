const express = require('express'),
      router  = express.Router({mergeParams: true}),
      Campground = require('../models/campground')

// INDEX - show all campgrounds
router.get('/', (req, res)=>{
  console.log(req.user)
  // Get all campgrounds from DB
  Campground.find({}, (err, allCampgrounds)=>{
    err ? console.log(`Error: ${err}`) : res.render('campgrounds/index', {campgrounds: allCampgrounds})
  })
})

// CREATE - add new campground to DB
router.post('/', (req, res)=>{
  const name = req.body.name
  const image = req.body.image
  const desc = req.body.description
  const newCampground = {name: name, image: image, description: desc}
  // Create a new campground and save to DB
  Campground.create(newCampground, (err, campground)=>{
    err ? console.log(`Error: ${err}`) : res.redirect('campgrounds')
  })
})

// NEW - show form to create new campground
router.get('/new', (req, res) => {
  res.render('campgrounds/new')
})

// SHOW - shows more info about one campground
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec( (err, foundCampground) => {
    err ? console.log(`error: ${err}`) : res.render('campgrounds/show', {campground: foundCampground})
  })
})

// middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}

module.exports = router