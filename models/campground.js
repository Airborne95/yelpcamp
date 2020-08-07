const mongoose = require('mongoose')
const Comment = require('./comment')

// Schema Setup
const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  price: String,
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
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