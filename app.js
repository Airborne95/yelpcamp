const express = require('express')
const app = express()

app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
  res.render('landing')
})

app.get('/campgrounds', (req, res)=>{
  var campgrounds = [
    {name: 'Salmon Creek', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Reflected_Peaks_Cowichan_Lake.jpg'},
    {name: 'Granite Hill', image: 'https://p0.pikist.com/photos/295/311/steppe-nature-grass-field-hill.jpg'},
    {name: 'Mountain Goat Top', image: 'https://cdn.pixabay.com/photo/2017/03/14/17/43/mountain-2143877_960_720.jpg'}
  ]

  res.render('campgrounds', {campgrounds: campgrounds})
})

app.get('*', (req, res)=>{
  res.send('Oops')
})


app.listen(3000, ()=>{
  console.log('YelpCamp Server has started http://localhost:3000')
})