var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment   = require("./models/comment");

var seeds = [
    {
        name: "Cloud's Rest",
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "bla bla bla"
    },
    {
        name: "Desert Mesa",
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "bla bla bla"
    },
    {
        name: "Canyon Floor",
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "bla bla bla"
    }
]

async function seedDB(){
  await Campground.remove({})
  await Comment.remove({})

  for(const seed of seeds){
    let campground = await Campground.create(seed)
    let comment = await Comment.create({
      text: "This place is great, but I wish there was internet",
      author: "Homer"
    })
    campground.comments.push(comment)
    campground.save()
  }
}


module.exports = seedDB;