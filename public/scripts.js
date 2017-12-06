// import { setInterval } from "timers";

// Client ID and API key from the Developer Console
const CLIENT_ID = '976883234635-qqhsooiclkcf4hhdq35oa94jafaelqud.apps.googleusercontent.com'

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']

// Authorization scopes required by the API multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/calendar'

const authorizeButton = document.querySelector( '#authorize-button' )
const signoutButton = document.querySelector( '#signout-button' )
const addNew = document.querySelector( '#add-new' )
const profileButton = document.querySelector( '#profile-button' )
const saveCal = document.querySelector( '#save-cal' )
const initialAnimation = document.querySelector('#initialAnimation');
const deadlineOverlay = document.querySelector('.deadline-overlay');
const deadlineOverlayBackground = document.querySelector('.deadline-overlay .overlay-background');
const deadlineOverlayClose = document.querySelector('.deadline-overlay #close');
const profileOverlay = document.querySelector('.profile-overlay');
const profileOverlayBackground = document.querySelector('.profile-overlay .overlay-background');
const profileOverlayClose = document.querySelector('.profile-overlay #close');

let agenda
let calendarColors = [];

/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
	gapi.load( 'client:auth2', initClient )
}

/*
	If you are already signed in to Google Calendar...
*/ 
(function initialChecks(){
	if(typeof gapi.auth2 !== 'undefined' && typeof gapi !== 'undefined') {
		if(gapi.auth2.getAuthInstance().isSignedIn.get())
		{
		console.log('saus');
			initialAnimation.style = 'display: none;'
		}
	}
})()

/**
*  Initializes the API client library and sets up sign-in state
*  listeners.
*/
function initClient() {
	
	gapi.client.init({
		discoveryDocs: DISCOVERY_DOCS,
		clientId: CLIENT_ID,
		scope: SCOPES
	}).then( () => {
		// Listen for sign-in state changes.
		gapi.auth2.getAuthInstance().isSignedIn.listen( updateSigninStatus )

		// Handle the initial sign-in state.
		updateSigninStatus( gapi.auth2.getAuthInstance().isSignedIn.get() )
		authorizeButton.addEventListener( 'click', handleAuthClick )
		signoutButton.addEventListener( 'click', handleSignoutClick )
		// addNew.addEventListener( 'click', addANewItem )
		// saveCal.addEventListener( 'click', saveCalendar )

	})

}

/**
*  Called when the signed in status changes, to update the UI
*  appropriately. After a sign-in, the API is called.
*/

function updateSigninStatus( isSignedIn ) {

	if ( isSignedIn ) {

		authorizeButton.style.display = 'none'
		signoutButton.style.display = 'block'

		document.body.style = "overflow: auto;"
		initialAnimation.style = "animation: .3s ease-in .5s 1 forwards slideOut"
		listUpcomingEvents()
		addTimeIndicator()
		setTimeout(setScrollPosition, 400)

	} else {
		authorizeButton.style.display = 'block'
		signoutButton.style.display = 'none'
	}
}

/**
*  Sign in the user upon button click.
*/

function handleAuthClick( event ) {

	gapi.auth2.getAuthInstance().signIn()

}

/**
*  Sign out the user upon button click.
*/
function handleSignoutClick( event ) {

	gapi.auth2.getAuthInstance().signOut()

}

/**
* Append a pre element to the body containing the given message
* as its text node. Used to display the results of the API call.
*
* @param {string} message Text to be placed in pre element.
*/
function appendPre( message ) {

	const pre = document.getElementById( 'content' )
	const textContent = document.createTextNode( message + '\n' )
	pre.appendChild( textContent )

}

/*
This function sets your viewport on current time and adds an indicator of the time
*/
function addTimeIndicator() {
	// console.log(moment().format('HH'));
	let currentTimeHours = moment().format('HH');
	let currentTimeMinutes = moment().format('mm');
	const timeOfDayColumn = document.querySelectorAll('.time-of-day');
	timeOfDayColumn.forEach( (time) => {
		const timeOfDayColumnInHours = time.textContent.replace(':00', '')
		if( currentTimeHours == timeOfDayColumnInHours ) {
			time.classList.add('currentHour')
		}
	} )

	const currentHourRow = document.querySelector('.currentHour');
	let positionTimeIndicator = ((currentHourRow.getBoundingClientRect().height / 60) * currentTimeMinutes).toFixed(2);
	for (let i = 0; i < document.styleSheets.length; i++) {
		const element = document.styleSheets[i];
		if(element.href.indexOf('style.css') > 1) {
			element.insertRule('.currentHour::before { top: '+positionTimeIndicator+'px}', 0);			
		}		
	}
}
//Change time every minute
setInterval(addTimeIndicator, 60000)	

/*
This function sets your scroll position to the current time on first visit or reload */

function setScrollPosition() {
	const currentHourRow = document.querySelector('.currentHour');
	let scrollPosition = (currentHourRow.getBoundingClientRect().top) - (window.innerHeight / 2)
	window.scrollTo( 0, scrollPosition )	
	console.log(scrollPosition);
}

/**
* Print the summary and start datetime/date of the next ten events in
* the authorized user's calendar. If no events are found an
* appropriate message is printed.
*/
let setMinimalDateEvents = new Date();
setMinimalDateEvents.setDate(setMinimalDateEvents.getDate() - 7)

let setMaximalDateEvents = new Date();
setMaximalDateEvents.setDate(setMaximalDateEvents.getDate() + 365)


function listUpcomingEvents() {
/*
Get primary calendars
*/
	gapi.client.calendar.events.list({
		'calendarId': 'primary',
		'timeMin': setMinimalDateEvents.toISOString(),
		'timeMax': setMaximalDateEvents.toISOString(),
		'showDeleted': false,
		'singleEvents': true,
		// 'maxResults': 10,
		'orderBy': 'startTime'
	}).then( response => {
		//All items that were fetched
		agenda = response.result.items
		//
		const events = response.result.items,
		//elWithDate = day columns
		elWithDate = document.querySelectorAll( '[data-date]' ),
		//Nodelist -> array
		elArr = Array.from( elWithDate ),
		//Makes dates of of data-date columns
		dates = elArr.map( d => moment( new Date( d.getAttribute( 'data-date' ) ) ).format( 'DD-MM-YYYY' ) )

		appendPre( 'Upcoming events:' )

		if ( events.length > 0 ) {
			for ( let i = 0; i < events.length; i++ ) {
				const event = events[ i ]
				let when = event.start.dateTime
				if ( !when ) {
					when = event.start.date
				}
				//change start: dateTime: "2022-05-23T22:00:00+02:00" to usable date
				const whenDate = moment( when ),
					day = whenDate.format( 'DD-MM-YYYY' ),
					match = dates.filter( d => d === day )[ 0 ]
				//Sets item into calendar
				if ( match ) {
					addCallItem( event )
				}
				//Check <pre> in HTML
				appendPre(event.summary + ' ( ' + when + ')' )
			}
		} else {
			appendPre( 'No upcoming events found.' )
		}
	})
/*
Get secondary calendars
*/
	gapi.client.calendar.calendarList.list({
		'calendarId': 'secondary',
		'timeMin': setMinimalDateEvents.toISOString(),
		'timeMax': setMaximalDateEvents.toISOString(),		
		'showDeleted': false,
		'singleEvents': true,
		// 'maxResults': 10,
		'orderBy': 'startTime'
	}).then( response => {
		//All items that were fetched
		agenda = response.result.items
		//
		const events = response.result.items,
		//elWithDate = day columns
			elWithDate = document.querySelectorAll( '[data-date]' ),
			//Nodelist -> array
			elArr = Array.from( elWithDate ),
			//Makes dates of of data-date columns
			dates = elArr.map( d => moment( new Date( d.getAttribute( 'data-date' ) ) ).format( 'DD-MM-YYYY' ) )

		// console.log( 'dates', dates )
		appendPre( 'Upcoming events:' )

		// console.log('events', events )
		events.forEach( (event, i) => {
				gapi.client.calendar.events.list({
					'calendarId': event.id,
					'timeMin': setMinimalDateEvents.toISOString(),
					'timeMax': setMaximalDateEvents.toISOString(),					
					'showDeleted': false,
					'singleEvents': true,
					// 'maxResults': 10,
					'orderBy': 'startTime'
				}).then( response => { 
					console.log(response.result);
					const eventsSec = response.result.items,
					//elWithDate = day columns
						elWithDateSec = document.querySelectorAll( '[data-date]' ),
						//Nodelist -> array
						elArrSec = Array.from( elWithDateSec ),
						//Makes dates of of data-date columns
						datesSec = elArrSec.map( d => moment( new Date( d.getAttribute( 'data-date' ) ) ).format( 'DD-MM-YYYY' ) )
			
					if ( eventsSec.length > 0 ) {
						
						for ( let i = 0; i < eventsSec.length; i++ ) {
							const event = eventsSec[ i ]
							let when = event.start.dateTime
							if ( !when ) {
								when = event.start.date
							}
							//change start: dateTime: "2022-05-23T22:00:00+02:00" to usable date
							const whenDate = moment( when )
								day = whenDate.format( 'DD-MM-YYYY' ),
								match = datesSec.filter( d => d === day )[ 0 ]
							//Sets item into calendar
							if ( match ) {
								addCallItem( event, i )
							}
							//Check <pre> in HTML
							appendPre(event.summary + ' ( ' + when + ')' )
						}
					} else {
						appendPre( 'No upcoming events found.' )
					}
				})		
		}) 
	})
	function getColors() {
		return gapi.client.calendar.colors.get({})
			.then(function(response) {
			  // Handle the results here (response.result has the parsed body).
			//   console.log("colors", response.result.calendar);
			  calendarColors = response.result.calendar
			}, function(error) {
			  console.error("Execute error", error);
			});
	}
	getColors();
}

//Gets and sets in local calendar
function addCallItem( obj, color ) {
	// console.log(obj.start.dateTime - obj.end.dateTime);
	const div = document.createElement( 'div' ),
		fullDay = obj.start.date,
		startTime = obj.start.dateTime,
		date = fullDay || startTime,
		startToDate = moment( new Date( date ) ),
		target = document.querySelector( `[data-day='${ startToDate.format( 'D' ) }']` )
		endTime = obj.end.dateTime
	div.textContent = obj.summary ? obj.summary : '(Geen Titel)'

	
	var __startTime = moment(startTime).format();
	var __endTime = moment(endTime).format();
	var __duration = moment.duration(moment(__endTime).diff(__startTime));
	var __hours = __duration.asHours();
	// console.log(__hours);
	

	div.classList.add( 'item' )
	div.setAttribute( 'colorId', obj.colorId )
	div.setAttribute( 'status', obj.status )

	div.setAttribute( 'data-begin', startToDate.hours() )
	div.setAttribute( 'data-end', startToDate.hours() + ( __hours ? __hours : 1 ) )
	
	div.style.top = !fullDay ? `calc( ( 200vh / 23 ) * ${ startToDate.hours() - 2 } )` : 0
	div.style.height = `calc( ( 200vh / 23 ) * ${ __hours ? __hours : 1 } )`
	div.style.width = '90%';
	function setCalendarColor() {
		if(typeof calendarColors[color + 1] !== 'undefined') {
			if (color + 1 !== NaN) {
				return calendarColors[color + 1].background
			}
			else {
				return '#0057e7'
			}	
		}
		else {
			return '#0057e7'
		}
	}
	div.style.backgroundColor = setCalendarColor();
	if ( target ) {
		target.appendChild( div )
	}

}

//Adds calendar item to google calendar
function addANewItem( obj ) {

	console.log( obj )

	const options = {
		'location': 'Amsterdam',
		'summary': obj.summary,
		'description': 'A chance to hear more about Google\'s developer products.',
		'colorId': obj.colorId,
		'status': obj.status,
		start: {},
		end: {}
	}

	if ( obj.start.dateTime ) {

		// startToDate = moment( new Date( date ) ),
		// startToDate.hours() + ( obj.hours ? obj.hours : 1 )

		console.log( obj.start.dateTime.add( obj.hours ? obj.hours : 1, 'hour' )._d )
		console.log( obj.start.dateTime.add( obj.hours ? obj.hours : 1, 'hour' ) )

		options.start.dateTime = obj.start.dateTime._d
		options.end.dateTime = obj.start.dateTime.add( obj.hours ? obj.hours : 1, 'hour' )._d

	} else {

		options.start.date = obj.start.date._d
		options.end.date = obj.end.date.add( obj.hours ? obj.hours : 1, 'hour' )._d

	}

	// if ( obj.end.dateTime ) {
	//
	// 	options.end.dateTime = obj.end.dateTime.add( 1, 'hour' )._d
	//
	// } else if ( options.end.date ) {
	//
	// 	options.end.date = obj.end.date.add( 1, 'hour' )._d
	//
	// } else {
	//
	// 	if ( obj.start.dateTime ) {
	//
	// 		options.end.dateTime = obj.start.dateTime.add( 1, 'hour' )._d
	//
	// 	} else {
	//
	// 		options.end.date = obj.start.date.add( 1, 'hour' )._d
	//
	// 	}
	//
	// }

	gapi.client.calendar.events.insert({
		'calendarId': 'primary',
		'resource': options
	}).then( response => {

		console.log( response )

	}).catch( err => {

		console.log( err )

	})

}

//For future references
function saveCalendar() {

	console.log( agenda )

	const obj = {
		calendar: agenda
	},
	myHeaders = new Headers()

	myHeaders.append( 'Content-Type', 'application/json' )

	fetch( '/setCalendar', {
		method: 'POST',
		headers: myHeaders,
		body: JSON.stringify( obj ),
		credentials: 'same-origin'
	}).then( response => {

		console.log( response )
		return response.json()

	}).then( res => {

		console.log( res )

	}).catch( err => {

		console.log( err )

	})

}

// START
// of making deadline
const deadlineSubmit = document.querySelector('.deadline-submit');
const deadlineTitle = document.querySelector('#deadline-title');
const deadlineEndDate = document.querySelector('#deadline-enddate');
const deadlineHours = document.querySelector('#deadline-hours');
const deadLineParameters = [];
deadlineSubmit.addEventListener('click', getDeadline)

const wakeUpTime = '8'
const sleepTime = '23';

function getDeadline() {
	deadLineParameters.push(deadlineTitle.value, deadlineEndDate.value, deadlineHours.value)
	console.log(deadLineParameters);

	showHidePopup(deadlineOverlay);

	const deadline = moment( new Date( deadLineParameters[ 1 ] ) ),
		daysRemaining = Number( deadline.fromNow( true )[0] ),
		hoursPerDay = Number( deadLineParameters[ 2 ] ) / daysRemaining

	console.log( daysRemaining )
	console.log( hoursPerDay )

	const options = {
		summary: deadLineParameters[ 0 ],
		start: {
			dateTime: deadline.hour( wakeUpTime )
		},
		colorId: 11,
		status: 'confirmed'
	}

	addCallItem( options )
	// addANewItem( options )

	let day = 1,
		leftOver =  0

	for ( let i = 0; i < daysRemaining; i++ ) {

		const time = moment().add( day, 'day' ).hour( wakeUpTime ),
			startToDate = moment( new Date( time ) ),
			dEl = document.querySelector( `[data-day='${ startToDate.format( 'D' ) }']` )

		console.log( dEl )
		let hours

		if ( leftOver !== 0 ) {

			hours = hoursPerDay + leftOver
			leftOver = 0

		} else {

			hours = hoursPerDay

		}


		if ( dEl && dEl.children.length > 0 ) {
			const firstBegin = Number( dEl.children[ 0 ].getAttribute( 'data-begin' )  ),
				maxEnd = Number( wakeUpTime ) + hoursPerDay

			if ( maxEnd > firstBegin ) {

				console.log( firstBegin )
				console.log( firstBegin - Number( wakeUpTime ) )
				console.log( Number( wakeUpTime ) - firstBegin )
				leftOver = hours - ( firstBegin - Number( wakeUpTime ) )
				hours = firstBegin - Number( wakeUpTime )
				console.log( leftOver )

			}

		}

		const o = {
			summary: `Werken aan ${deadLineParameters[ 0 ]}`,
			start: {
				// date: moment().add( day, 'day' )
				dateTime: moment().add( day, 'day' ).hour( wakeUpTime )
			},
			hours: hours,
			colorId: 11,
			status: 'confirmed'
		}

		addCallItem( o )
		// addANewItem( o )

		day++

	}
}
//END making deadline


let deadlineOverlayGroup = [];
deadlineOverlayGroup.push(addNew, deadlineOverlayClose, deadlineOverlayBackground)
deadlineOverlayGroup.forEach(function(elem){
	elem.addEventListener('click', function(){
		showHidePopup(deadlineOverlay);
	});
})
let profileOverlayGroup = [];
profileOverlayGroup.push(profileButton, profileOverlayClose, profileOverlayBackground)
profileOverlayGroup.forEach(function(elem){
	elem.addEventListener('click', function(){
		showHidePopup(profileOverlay);
	});
})

// const agenda = document.querySelector('.agenda');
