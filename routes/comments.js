const express = require('express'),
      router  = express.Router({mergeParams: true}),
      Campground = require('../models/campground'),
      Comment = require('../models/comment')

// comments new
router.get('/new', isLoggedIn, (req, res)=>{
  console.log(req.params.id)
  Campground.findById(req.params.id, (err, campground) => {
    err ? console.log(err) : res.render('comments/new', {campground: campground})
  })
})

// comments create
router.post('/', isLoggedIn,(req, res)=>{
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

// middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}

module.exports = router