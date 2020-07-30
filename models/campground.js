const mongoose = require('mongoose')
const Comment = require('./comment')

// Schema Setup
const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  price: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
})
// gets invoked before a .remove gets run
// cannot use arrow syntax or it wont work..
campgroundSchema.pre('remove', async function (next) {
  console.log('Pre hook fired')
  console.log(this)
  try {
    await Comment.remove({
      '_id': {
        $in: this.comments
      }
    })
    next()
  } catch(err){
    next(err)
  }
})

module.exports = mongoose.model('Campground', campgroundSchema)