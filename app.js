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

	let weekNum = 0

	if ( req.body.calendar ) res.locals.calender = req.body.calendar
	if ( req.query.week ) weekNum = Number( req.query.week )

	const monday = moment().day( 'Monday' ),
	today = moment().format( 'D' )
	week = getWeek( monday, weekNum ),
	date = getDate( monday, weekNum ),
	nextWeek = weekNum + 1,
	prevWeek = weekNum - 1

	res.render( 'index', { week, today, nextWeek, prevWeek, date } )

})

app.post( '/setCalendar', ( req, res ) => {

	req.session.calendar = req.body.calendar

	res.json( { hi: 'hi' } )

})

app.listen( PORT, () => {

	console.log( `I'm at ${PORT}` )

})

function getWeek( monday, weekNum = 0 ) {

	const week = [
		moment( monday ).add( weekNum * 7, 'days' ).format( 'D' ),
		moment( monday ).add( 1 + ( weekNum * 7 ), 'days' ).format( 'D' ),
		moment( monday ).add( 2 + ( weekNum * 7 ), 'days' ).format( 'D' ),
		moment( monday ).add( 3 + ( weekNum * 7 ), 'days' ).format( 'D' ),
		moment( monday ).add( 4 + ( weekNum * 7 ), 'days' ).format( 'D' ),
		moment( monday ).add( 5 + ( weekNum * 7 ), 'days' ).format( 'D' ),
		moment( monday ).add( 6 + ( weekNum * 7 ), 'days' ).format( 'D' )
	]

	return week

}

function getDate( monday, weekNum = 0 ) {

	const week = [
		moment( monday ).add( weekNum * 7, 'days' ),
		moment( monday ).add( 1 + ( weekNum * 7 ), 'days' ),
		moment( monday ).add( 2 + ( weekNum * 7 ), 'days' ),
		moment( monday ).add( 3 + ( weekNum * 7 ), 'days' ),
		moment( monday ).add( 4 + ( weekNum * 7 ), 'days' ),
		moment( monday ).add( 5 + ( weekNum * 7 ), 'days' ),
		moment( monday ).add( 6 + ( weekNum * 7 ), 'days' )
	]

	return week

}
