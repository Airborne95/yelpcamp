const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')

// Temp
var campgrounds = [
  {name: 'Salmon Creek', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Reflected_Peaks_Cowichan_Lake.jpg'},
  {name: 'Granite Hill', image: 'https://p0.pikist.com/photos/295/311/steppe-nature-grass-field-hill.jpg'},
  {name: 'Mountain Goat Top', image: 'https://cdn.pixabay.com/photo/2017/03/14/17/43/mountain-2143877_960_720.jpg'}
]

// ======================================================
//                       Get Routes
// ======================================================
app.get('/', (req, res)=>{
  res.render('landing')
})

app.get('/campgrounds', (req, res)=>{
   res.render('campgrounds', {campgrounds: campgrounds})
})

app.get('/campgrounds/new', (req, res) => {
  res.render('new')
})

app.get('*', (req, res)=>{
  res.send('Oops')
})

// ======================================================
//                        Post Routes
// ======================================================

app.post('/campgrounds', (req, res)=>{
  const name = req.body.name
  const image = req.body.image
  const newCampground = {name: name, image: image}
  campgrounds.push(newCampground)
  res.redirect('campgrounds')
})

// ======================================================
//                        Start App
// ======================================================
app.listen(3000, ()=>{
  console.log('YelpCamp Server has started http://localhost:3000')
})