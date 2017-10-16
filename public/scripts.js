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
		addNew.addEventListener( 'click', addANewItem )

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

	console.log( gapi.client )
	console.log( (moment().add( 3, 'days' ).add(1, 'hour')._d).toISOString() )
	gapi.client.calendar.events.list({
		'calendarId': 'primary',
		'timeMin': ( new Date() ).toISOString(),
		'showDeleted': false,
		'singleEvents': true,
		'maxResults': 10,
		'orderBy': 'startTime'
	}).then( response => {

		const events = response.result.items
		appendPre( 'Upcoming events:' )

		if ( events.length > 0 ) {

			for ( let i = 0; i < events.length; i++ ) {

				const event = events[ i ]
				let when = event.start.dateTime

				if ( !when ) {

					when = event.start.date

				}

				appendPre(event.summary + ' ( ' + when + ')' )

			}

		} else {

			appendPre( 'No upcoming events found.' )

		}

	})

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
