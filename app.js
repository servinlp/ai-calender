const express = require( 'express' ),
	app = express(),
	ejs = require( 'ejs' ),
	bodyParser = require( 'body-parser' ),
	PORT = 8000


app.use( express.static( 'public' ) )
app.set( 'views', './views' )

app.set( 'view engine', 'ejs' )

app.use( bodyParser.urlencoded({ extended: false }) )
app.use( bodyParser.json() )

app.get( '/', ( req, res ) => {

	res.render( 'index' )

})

app.listen( PORT, () => {

	console.log( `I'm at ${PORT}` )

})
