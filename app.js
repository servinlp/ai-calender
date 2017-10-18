const express = require( 'express' ),
	session = require( 'express-session' ),
	app = express(),
	ejs = require( 'ejs' ),
	bodyParser = require( 'body-parser' ),
	moment = require( 'moment' ),
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

	const monday = moment().day( 'Monday' ),
	week = getWeek( monday )

	console.log( monday )
	console.log( week )

	res.render( 'index', { week } )

})

app.post( '/setCalendar', ( req, res ) => {

	req.session.calendar = req.body.calendar

	res.json( { hi: 'hi' } )

})

app.listen( PORT, () => {

	console.log( `I'm at ${PORT}` )

})

function getWeek( monday ) {

	const week = [
		moment( monday ),
		moment( monday ).add( 1, 'days' ),
		moment( monday ).add( 2, 'days' ),
		moment( monday ).add( 3, 'days' ),
		moment( monday ).add( 4, 'days' ),
		moment( monday ).add( 5, 'days' ),
		moment( monday ).add( 6, 'days' )
	]

	return week

}
