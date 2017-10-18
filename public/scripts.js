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
const saveCal = document.querySelector( '#save-cal' )

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
		addNew.addEventListener( 'click', addANewItem )
		saveCal.addEventListener( 'click', saveCalendar )

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

	gapi.client.calendar.events.list({
		'calendarId': 'primary',
		'timeMin': ( new Date() ).toISOString(),
		'showDeleted': false,
		'singleEvents': true,
		'maxResults': 10,
		'orderBy': 'startTime'
	}).then( response => {

		agenda = response.result.items

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

document.querySelectorAll('.time-of-day').forEach(function(time, i){
	console.log(i)
})
// const agenda = document.querySelector('.agenda');
//Rewrote https://tympanus.net/Development/CreativeGooeyEffects/menu.html so JQuery isn't needed anymore
const menuItem = document.querySelectorAll('.menu-item');
const menuToggleButton = document.querySelector(".menu-toggle-button");
const menuToggleIcon = document.querySelector(".menu-toggle-icon");

const menuItemNum = menuItem.length;
let angle = 70;
const distance = 80;
let startingAngle = 145 + ( -angle / 2 );
let slice = angle / ( menuItemNum - 1 );
let on = false;

menuItem.forEach(function(item, i){
	angle = startingAngle + ( slice * i );
	item.style.transform = "rotate("+(angle)+"deg)";
	item.querySelector(".menu-item-icon").style.transform = "rotate("+(-angle)+"deg)"
})

function closeMenuToggle() {
	TweenMax.to( menuToggleIcon, 0.1, {
		scale: 1
	})
}

document.addEventListener('mouseup', closeMenuToggle )

document.addEventListener('touchend', closeMenuToggle )

menuToggleButton.addEventListener('mousedown', pressHandler )
menuToggleButton.addEventListener('touchstart', function(event) {
	pressHandler();
	event.preventDefault();
	event.stopPropagation();
})

function pressHandler(event){
	TweenMax.to( menuToggleIcon, 0.1, {
		scale: 1.5
	})
	on = !on;
	TweenMax.to(menuToggleButton.querySelector('.menu-toggle-icon'),0.4,{
		transformOrigin: "50% 50%",
		rotation: on ? 45 : 0,
		ease:Quint.easeInOut
	});

	on ? openMenu() : closeMenu();
}

function openMenu(){
	menuItem.forEach(function(item, i){
		let delay = i * 0.08;
		let $bounce = item.querySelector(".menu-item-bounce");
		TweenMax.fromTo( $bounce, 0.2, {
			transformOrigin:"50% 50%"
		},{
			delay: delay,
			scaleX: 0.9,
			scaleY: 1.2,
			ease: Quad.easeInOut,
			onComplete: function(){
				TweenMax.to( $bounce, 0.15, {
					scaleY: 0.8,
					ease: Quad.easeInOut,
					onComplete: function(){
						TweenMax.to( $bounce, 3, {
							scaleY: .95,
							scaleX: .95,
							ease: Elastic.easeOut,
							easeParams: [1.1,0.12]
						})
					}
				})
			}
		});
		TweenMax.to(item.querySelector(".menu-item-button"), 0.5, {
			delay: delay,
			y: distance,
			ease: Quint.easeInOut
		});
	})
}

function closeMenu(){
	menuItem.forEach(function(item, i){
		let delay = i * 0.08;
		let $bounce= item.querySelector(".menu-item-bounce");
		TweenMax.fromTo( $bounce, 0.2, {
			transformOrigin:"50% 50%"
		},{
			delay: delay,
			scaleX: 1,
			scaleY: 0.8,
			ease: Quad.easeInOut,
			onComplete: function(){
				TweenMax.to( $bounce, 0.15, {
					scaleY: 1.2,
					ease: Quad.easeInOut,
					onComplete: function(){
						TweenMax.to( $bounce, 3, {
							scaleY: 1,
							ease: Elastic.easeOut,
							easeParams: [1.1,0.12]
						})
					}
				})
			}
		});
		TweenMax.to(item.querySelector(".menu-item-button"), 0.2, {
			delay: delay,
			y: 0,
			ease: Quint.easeIn
		});
	})
}

function tweenReady() {

	TweenMax.globalTimeScale( 1 )
	
}
