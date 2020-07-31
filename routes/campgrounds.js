const express = require('express'),
      router  = express.Router({mergeParams: true}),
      Campground = require('../models/campground'),
      Comment   = require('../models/comment')
      middleware = require('../middleware'),
      NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

// INDEX - show all campgrounds
router.get('/', (req, res)=>{
  // Get all campgrounds from DB
  Campground.find({}, (err, allCampgrounds)=>{
    err ? console.log(`Error: ${err}`) : res.render('campgrounds/index', { campgrounds: allCampgrounds, page: 'campgrounds' })
  })
})

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  const name = req.body.name
  const image = req.body.image
  const desc = req.body.description
  const price = req.body.price
  const author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      console.log(err) //DEBUG
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, price: price, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated); //DEBUG
            res.redirect("/campgrounds");
        }
    });
  });
});
// ===================================================

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
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect(`/campgrounds/${req.params.id}`)
        }
    });
  });
});

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