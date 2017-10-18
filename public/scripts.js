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
console.log(deadlineOverlayClose);
let agenda

/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {

	gapi.load( 'client:auth2', initClient )

}

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
		initialAnimation.style = "animation: .7s ease-out .5s 1 forwards slideOut"
		listUpcomingEvents()

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

/**
* Print the summary and start datetime/date of the next ten events in
* the authorized user's calendar. If no events are found an
* appropriate message is printed.
*/
function listUpcomingEvents() {

	gapi.client.calendar.events.list({
		'calendarId': 'primary',
		'timeMin': ( new Date() ).toISOString(),
		'showDeleted': false,
		'singleEvents': true,
		'maxResults': 10,
		'orderBy': 'startTime'
	}).then( response => {

		agenda = response.result.items

		const events = response.result.items,
			elWithDate = document.querySelectorAll( '[data-date]' ),
			elArr = Array.from( elWithDate ),
			dates = elArr.map( d => moment( new Date( d.getAttribute( 'data-date' ) ) ).format( 'DD-MM-YYYY' ) )
			// dates = elArr.map( d => new Date( d.getAttribute( 'data-date' ) ) )

		console.log( dates )

		appendPre( 'Upcoming events:' )

		console.log( events )

		if ( events.length > 0 ) {

			for ( let i = 0; i < events.length; i++ ) {

				const event = events[ i ]
				let when = event.start.dateTime

				if ( !when ) {

					when = event.start.date

				}

				const whenDate = moment( when )
					day = whenDate.format( 'DD-MM-YYYY' ),
					match = dates.filter( d => d === day )[ 0 ]

				if ( match ) {

					console.log( whenDate )
					console.log( event )
					addCallItem( event )

				}

				appendPre(event.summary + ' ( ' + when + ')' )

			}

		} else {

			appendPre( 'No upcoming events found.' )

		}

	})

}

function addCallItem( obj ) {

	const div = document.createElement( 'div' ),
		startTime = obj.start.dateTime || obj.start.date,
		startToDate = moment( new Date( startTime ) ),
		target = document.querySelector( `[data-day='${ startToDate.format( 'D' ) }']` )

	console.log( target )

	div.textContent = obj.summary

	// div.classList.add( `color${obj.colorId}` )
	div.classList.add( 'item' )
	div.setAttribute( 'colorId', obj.colorId )
	div.setAttribute( 'status', obj.status )

	div.style.top = `calc( ( 200vh / 23 ) * ${ startToDate.hours() - 1 } )`
	div.style.height = `calc((200vh / 23) * 1)`
	div.style.width = '90%'
	div.style.backgroundColor = '#0057e7'

	target.appendChild( div )

}

function addANewItem() {

	const options = {
		'start': {
			'dateTime': ( moment().add( 3, 'days' )._d ).toISOString()
		},
		'end': {
			'dateTime': ( moment().add( 3, 'days' ).add(1, 'hour')._d ).toISOString()
		},
		'location': 'Amsterdam',
		'summary': 'hacks :)',
		'description': 'A chance to hear more about Google\'s developer products.'
	}

	gapi.client.calendar.events.insert({
		'calendarId': 'primary',
		'resource': options
	}).then( response => {

		console.log( response )

	}).catch( err => {

		console.log( err )

	})

}

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

const deadlineSubmit = document.querySelector('.deadline-submit');
const deadlineTitle = document.querySelector('#deadline-title');
const deadlineEndDate = document.querySelector('#deadline-enddate');
const deadlineHours = document.querySelector('#deadline-hours');
const deadLineParameters = [];
deadlineSubmit.addEventListener('click', getDeadline)

const wakeUpTime = '08:00';
const sleepTime = '23:00';

function getDeadline() {
	deadLineParameters.push(deadlineTitle.value, deadlineEndDate.value, deadlineHours.value)
	console.log(deadLineParameters);

	showHidePopup(deadlineOverlay);
}

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
