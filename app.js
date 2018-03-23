const express = require( 'express' ),
	session = require( 'express-session' ),
	app = express(),
	ejs = require( 'ejs' ),
	bodyParser = require( 'body-parser' ),
	moment = require( 'moment' ),
	PORT = 8000
	// PouchDB = require('pouchdb')
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

app.get( '/images/favicons', (req, res) => {
	res.redirect('/')
})
//Get index 
app.get( '/', ( req, res ) => {
	//Current week
	let weekNum = 0
	
	if ( req.body.calendar ) res.locals.calender = req.body.calendar
	//Next page --> weekNum ...
	if ( req.query.week ) weekNum = Number( req.query.week )

	const monday = moment().day( 'Monday' ),
	today = moment().format( 'D' )
	week = getWeek( monday, weekNum ),
	date = getDate( monday, weekNum ),
	nextWeek = weekNum + 1
	prevWeek = weekNum - 1
	// console.log('week:', week, 'date', date)
	//Renders all data into calendar (header)
	res.render( 'index', { week, today, nextWeek, prevWeek, date } )

})

//Not used anymore, used to save calendar, check scripts.js
app.post( '/setCalendar', ( req, res ) => {

	req.session.calendar = req.body.calendar

	res.json( { hi: 'hi' } )

})

//Port
app.listen( PORT, () => {

	console.log( `I'm at ${PORT}` )

})

//Gets days of week
function getWeek( monday, weekNum = 0 ) {

	const week = [
		//Current day + week number * seven days for checking of next weeks
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
		//
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
