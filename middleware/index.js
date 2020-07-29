const Campground = require('../models/campground'),
      Comment = require('../models/comment')

const middlewareObj = {}

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
  if(req.isAuthenticated()){
    Campground.findById(req.params.id, (err, foundCampground)=>{
      if(err){
        res.redirect('back')
      } else {
        if(foundCampground.author.id.equals(req.user._id)){
          next()
        }else{
          res.redirect('back')
        }
      }
    })
  } else {
    res.redirect('back')
  }
}

middlewareObj.checkCommentOwnership =  (req, res, next) => {
  if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, (err, foundComment)=>{
      if(err){
        res.redirect('back')
      } else {
        // does user own the comment?
        if(foundComment.author.id.equals(req.user._id)){
          next()
        }else{
          res.redirect('back')
        }
      }
    })
  } else {
    // No user was signed in
    res.redirect('back')
  }
}

// middleware
middlewareObj.isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next()
  }
  req.flash('error', 'Please login first!')
  res.redirect('/login')
}

module.exports = middlewareObj