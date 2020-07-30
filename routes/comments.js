const express = require('express'),
      router  = express.Router({mergeParams: true}),
      Campground = require('../models/campground'),
      Comment = require('../models/comment'),
      middleware = require('../middleware')

// COMMENT NEW
router.get('/new', middleware.isLoggedIn, (req, res)=>{
  Campground.findById(req.params.id, (err, campground) => {
    err ? console.log(err) : res.render('comments/new', {campground: campground})
  })
})

/// COMMENT CREATE
router.post('/', middleware.isLoggedIn,(req, res)=>{
  Campground.findById(req.params.id, (err, campground) => {
    if(err){
      console.log(err)
      req.flash('error', 'Something went wrong')
      res.redirect('/campgrounds')
    } else{
      Comment.create(req.body.comment, (err, comment) => {
        if(err){
          console.log(err)
        } else {
          // add username and id to comment
          comment.author.id = req.user._id
          comment.author.username = req.user.username
          // save comment
          comment.save()
          campground.comments.push(comment)
          campground.save()
          req.flash('success', 'Succesfully added comment')
          res.redirect(`/campgrounds/${campground._id}`)
        }
      })
    }
  })
})

// COMMENT EDIT
router.get('/:comment_id/edit', middleware.checkCommentOwnership ,async (req,res)=>{
  Campground.findById(req.params.id, (err, foundCampground)=>{
    if(err || !foundCampground){
      req.flash('error', 'No campground found')
      return res.redirect('back')
    }
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if(err || !foundComment){
        return res.redirect('back')
      }
      res.render('comments/edit', {campground_id: req.params.id, comment: foundComment})
    })

  })
  // My attempt at using async instead
  // try {
  //   const campground = await Campground.findById(req.params.id)
  //   const comment = await Comment.findById(req.params.comment_id)
  //   res.render('comments/edit', {campground_id: campground._id, comment: comment})
  // } catch (err) {
  //   req.flash('error', err.message)
  //   console.log(err)
  //   res.redirect('back')
  // }

})

// COMMENT UPDATE
router.put('/:comment_id', middleware.checkCommentOwnership, async (req, res)=>{
  try{
    await Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment)
    res.redirect(`/campgrounds/${req.params.id}`)
  } catch (err) {
    return res.redirect('back')
  }
})

// COMMENTS DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res)=>{
  Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
    if(err){
      res.redirect('back')
    }else{
      req.flash('success', 'Comment deleted')
      res.redirect(`/campgrounds/${req.params.id}`)
    }
  })
})

module.exports = router