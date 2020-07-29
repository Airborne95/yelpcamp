const express = require('express'),
      router  = express.Router({mergeParams: true}),
      Campground = require('../models/campground'),
      Comment = require('../models/comment')

// comments new
router.get('/new', isLoggedIn, (req, res)=>{
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
          // add username and id to comment
          comment.author.id = req.user._id
          comment.author.username = req.user.username
          // save comment
          comment.save()
          campground.comments.push(comment)
          campground.save()
          console.log(comment)
          res.redirect(`/campgrounds/${campground._id}`)
        }
      })
    }
  })
})

router.get('/:comment_id/edit', async (req,res)=>{
  try {
    const comment = await Comment.findById(req.params.comment_id)
    res.render('comments/edit', {campground_id: req.params.id, comment: comment})
  } catch (err) {
    res.redirect('back')
  }

})

router.put('/:comment_id', async (req, res)=>{
  try{
    await Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment)
    res.redirect(`/campgrounds/${req.params.id}`)
  } catch (err) {
    return res.redirect('back')
  }
})

router.delete('/:comment_id', (req, res)=>{
  Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
    err ? res.redirect('back') : res.redirect(`/campgrounds/${req.params.id}`)
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