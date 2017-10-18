const express = require( 'express' ),
	session = require( 'express-session' ),
	app = express(),
	ejs = require( 'ejs' ),
	bodyParser = require( 'body-parser' ),
	PORT = 8000


app.use( express.static( 'public' ) )
app.set( 'views', './views' )

app.set( 'view engine', 'ejs' )

app.use( bodyParser.urlencoded({ extended: false }) )
app.use( bodyParser.json() )

app.use( session({
	secret: 'asdasdasdas',
	resave: false,
	saveUninitialized: false
}) )

app.get( '/', ( req, res ) => {

	if ( req.body.calendar ) res.locals.calender = req.body.calendar

	res.render( 'index' )

})

app.post( '/setCalendar', ( req, res ) => {

	req.session.calendar = req.body.calendar

	res.json( { hi: 'hi' } )

})

app.listen( PORT, () => {

	console.log( `I'm at ${PORT}` )

})
