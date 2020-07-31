const express = require('express'),
      router  = express.Router({mergeParams: true}),
      Campground = require('../models/campground'),
      Comment   = require('../models/comment')
      middleware = require('../middleware')

// INDEX - show all campgrounds
router.get('/', (req, res)=>{
  // Get all campgrounds from DB
  Campground.find({}, (err, allCampgrounds)=>{
    err ? console.log(`Error: ${err}`) : res.render('campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' })
  })
})

// CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res)=>{
  const name = req.body.name
  const image = req.body.image
  const desc = req.body.description
  const price = req.body.price
  const author = {
    id: req.user._id,
    username: req.user.username
  }
  const newCampground = { name: name, price: price, image: image, description: desc, author: author }

  // Create a new campground and save to DB
  Campground.create(newCampground, (err, campground)=>{
    err ? console.log(`Error: ${err}`) : res.redirect('campgrounds')
  })
})

// NEW - show form to create new campground
router.get('/new',middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new')
})

// SHOW - shows more info about one campground
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec( (err, foundCampground) => {
    if(err || !foundCampground){
      console.log(`error: ${err}`)
      req.flash('error', 'Campground not found')
      res.redirect('back')
    } else {
      res.render('campgrounds/show', {campground: foundCampground})
    }
  })
})

// EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res)=> {
  Campground.findById(req.params.id, (err, foundCampground)=>{
    err && req.flash('error', 'Campground not found')
    res.render('campgrounds/edit', {campground: foundCampground})
  })
})

// UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  // find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
    err ? res.redirect('/campground') : res.redirect(`/campgrounds/${req.params.id}`)
  })
  // redirect somewhere (show page)
})

// DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res, next)=>{
  Campground.findById(req.params.id, (err, campground)=>{
    if(err) return next(err)

    campground.remove()
    req.flash('success', 'Campground delete succesfully')
    res.redirect('/campgrounds')
  })
})

module.exports = router