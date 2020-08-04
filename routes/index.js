const { nextTick } = require('process')

const express = require('express'),
      router  = express.Router(),
      passport = require('passport'),
      User = require('../models/user'),
      Campground = require('../models/campground'),
      async = require('async')
      nodemailer = require('nodemailer'),
      crypto = require('crypto')

// root route
router.get('/', (req, res)=>{
  res.render('landing')
})

// show register form
router.get('/register', (req, res)=>{
  res.render('register', { page: 'register' })
})

// handle sign up logic
router.post('/register', (req, res)=>{
  const newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar
  })
  if(req.body.adminCode === 'secretcode123'){
    newUser.isAdmin = true
  }
  User.register(newUser, req.body.password, (err, user)=>{
    if(err){
      req.flash('error', err.message)
      return res.redirect('/register')
    }
    passport.authenticate('local')(req, res, ()=>{
      req.flash('success', `Welcome to Yelpcamp ${user.username}`)
      res.redirect('/campgrounds')
    })
  })
})

// show login form
router.get('/login', (req, res)=>{
  res.render('login', { page: 'login' })
})

// handling login logic
router.post('/login', passport.authenticate('local',{
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}),(req, res)=>{
})

// logout route
router.get('/logout', (req, res)=>{
  req.logout()
  req.flash('success', 'Logged you out!')
  res.redirect('/campgrounds')
})

// Forgot Password
router.get('/forgot', (req, res) => {
  res.render('forgot')
})

// Forgot Password Logic
router.post('/forgot', (req, res)=>{
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf)=>{
        const token = buf.toString('hex')
        done(err, token)
      })
    },
    (token, done) => {
      User.findOne({ email: req.body.email}, (err, user) => {
        if(!user){
          req.flash('error', 'No account with that email address exists')
          return res.redirect('/forgot')
        }
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

        user.save((err) => {
          done(err, token, user)
        })
      })
    },
    (token, user, done) => {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'arkstash@gmail.com',
          pass: process.env.GMAILPW
        }
      })
      const mailOptions = {
        to: user.email,
        from: 'arkstash@gmail.com',
        subject: 'YelpCamp Practice Password Reset',
        text:
        `Somebody (hopefully you) requested a new password for the YelpCamp acccount for ${user.email}. No changes have been made to your account yet.\n\n
        You can reset your email password by clicking the link below:\n\n
        http://${req.header.host}/reset/${token} \n\n
        If you did not request this, please let us know immediately by replying to this email.\n\n

        Yours,\n\n

        The YelpCamp team\n\n
        `
      }
      smtpTransport.sendMail(mailOptions, (err)=>{
        console.log('mail sent')

        req.header('success', `An email has been sent to ${user.email} with further instructions`)
        done(err, 'done')
      })
    }
  ]), (err) => {
    if(err) return next(err)
    res.redirect('/forgot')
  }
})

// Reset Password Page
router.get('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, (err, user) => {
    if(!user){
      req.flash('error', 'Password reset token is invalid or has expired')
      return res.redirect('/forget')
    }
    res.render('reset', { token: req.params.token })
  })
})

// Reset Password Logic
router.post('/reset/:token', (req, res) => {
  async.waterfall([
    (done) => {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, (err, user)=>{
        if(!user) {
          req.flash('error', 'Password reset token is invalid or has expired')
          return res.redirect('back')
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, err => {
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined

            user.save(err => {
              req.logIn(user, err => {
                done(err, user)
              })
            })
          })
        } else {
          req.flash('error', 'Passwords do not match')
          return res.redirect('back')
        }
      })
    },
    (user, done) => {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'arkstash@gmail.com',
          pass: process.env.GMAILPW
        }
      })
      const mailOptions = {
        to: user.email,
        from: 'arkstash@gmail.com',
        subject: 'YelpCamp password has been changed',
        text:
        `Hello, \n\n
        This is a confirmation that the password for your accouint ${user.email} has just been changed\n
        `
      }
      smtpTransport.sendMail(mailOptions, err => {
        req.flash('success', 'Success! Your password has been changed.')
        done(err)
      })
    }
  ]), err => {
    res.redirect('/campgrounds')
  }
})

// USER PROFILE
router.get('/users/:id', (req, res)=>{
  User.findById(req.params.id, (err, foundUser)=>{
    if(err){
      req.flash('err', 'Something went wrong.')
      res.redirect('back')
    }
    Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
      if(err){
        req.flash('err', 'Something went wrong.')
        res.redirect('back')
      }
      res.render('users/show', { user: foundUser, campgrounds:campgrounds })
    })

  })
})

module.exports = router