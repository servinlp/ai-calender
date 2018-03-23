// import { setInterval } from "timers";

// Client ID and API key from the Developer Console
const CLIENT_ID = '976883234635-qqhsooiclkcf4hhdq35oa94jafaelqud.apps.googleusercontent.com'
// const CLIENT_ID = '701290890115-lqin029eu5epe1sqq1jcrf1bjom2g76s.apps.googleusercontent.com'

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']

// Authorization scopes required by the API multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/calendar'

const authorizeButton = document.querySelector( '#authorize-button' )
const signoutButton = document.querySelector( '#signout-button' )
const addNew = document.querySelector( '#add-new' )
const profileButton = document.querySelector( '#profile-button' )
const initialAnimation = document.querySelector('#initialAnimation');
const deadlineOverlay = document.querySelector('.deadline-overlay');
const deadlineOverlayBackground = document.querySelector('.deadline-overlay .overlay-background');
const deadlineOverlayClose = document.querySelector('.deadline-overlay #close');
const profileOverlay = document.querySelector('.profile-overlay');
const profileOverlayBackground = document.querySelector('.profile-overlay .overlay-background');
const profileOverlayClose = document.querySelector('.profile-overlay #close');
const preferenceButton = document.querySelector('#preference-button')
const preferenceOverlay = document.querySelector('.preference-overlay');
const preferenceOverlayBackground = document.querySelector('.preference-overlay .overlay-background');
const preferenceOverlayClose = document.querySelector('.preference-overlay #close');
const replanButton = document.querySelector('#replan-button')
const replanOverlay = document.querySelector('.replan-overlay');
const replanOverlayBackground = document.querySelector('.replan-overlay .overlay-background');
const replanOverlayClose = document.querySelector('.replan-overlay #close');

let agenda;
let calendarColors = [];
let googleCalendarColors = [];
let allCalendarsThatWereGet = [];
let allCalendarEvents = [];
let hoursNeededForDeadline = 0;
let maxHoursPerDayForDeadline = 0;
let day = 0;
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

// if ('serviceWorker' in navigator) {
// 	window.addEventListener('load', function () {
// 		navigator.serviceWorker.register('/serviceworker.js').then(function (registration) {
// 			// Registration was successful
// 			console.log('ServiceWorker registration successful with scope: ', registration.scope);
// 		}, function (err) {
// 			// registration failed :(
// 			console.log('ServiceWorker registration failed: ', err);
// 		});
// 	});
// }

// window.addEventListener('beforeinstallprompt', function (e) {
// 	// beforeinstallprompt Event fired

// 	// e.userChoice will return a Promise.
// 	// For more details read: https://developers.google.com/web/fundamentals/getting-started/primers/promises
// 	e.userChoice.then(function (choiceResult) {

// 		console.log(choiceResult.outcome);

// 		if (choiceResult.outcome == 'dismissed') {
// 			console.log('User cancelled home screen install');
// 		}
// 		else {
// 			console.log('User added to home screen');
// 		}
// 	});
// });


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
		initialAnimation.style = "animation: .3s ease-out .5s 1 forwards slideOut"
		listUpcomingEvents()
		addTimeIndicator()
		setScrollPosition()
		showHidePopup(preferenceOverlay);

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
		if( currentTimeHours === timeOfDayColumnInHours ) {
			time.classList.add('currentHour')
		}
		// if (timeOfDayColumnInHours === '0') {
			//there is a bug when its 00:.. a clock
		// }
	} )

	const currentHourRow = document.querySelector('.currentHour');
	let positionTimeIndicator = ((currentHourRow.getBoundingClientRect().height / 60) * currentTimeMinutes).toFixed(2);
	for (let i = 0; i < document.styleSheets.length; i++) {
		const element = document.styleSheets[i];
		// console.log(element)
		if(element.href !== null && element.href.indexOf('style.css') > 1) {
			// console.log(element.href)
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
	// console.log(scrollPosition);
}

/**
* Print the summary and start datetime/date of the next ten events in
* the authorized user's calendar. If no events are found an
* appropriate message is printed.
*/
let setMinimalDateEvents = new Date();
setMinimalDateEvents.setDate(setMinimalDateEvents.getDate() - 7)

let setMaximalDateEvents = new Date();
setMaximalDateEvents.setDate(setMaximalDateEvents.getDate() + (365 / 4))

function listUpcomingEvents() {
/*
Get primary calendars
*/
	// gapi.client.calendar.events.list({
	// 	'calendarId': 'primary',
	// 	'timeMin': setMinimalDateEvents.toISOString(),
	// 	'timeMax': setMaximalDateEvents.toISOString(),
	// 	'showDeleted': false,
	// 	'singleEvents': true,
	// 	// 'maxResults': 10,
	// 	'orderBy': 'startTime'
	// }).then( response => {
	// 	//All items that were fetched
	// 	agenda = response.result.items
	// 	//
	// 	const events = response.result.items,
	// 	//elWithDate = day columns
	// 	elWithDate = document.querySelectorAll( '[data-date]' ),
	// 	//Nodelist -> array
	// 	elArr = Array.from( elWithDate ),
	// 	//Makes dates of of data-date columns
	// 	dates = elArr.map( d => moment( new Date( d.getAttribute( 'data-date' ) ) ).format( 'DD-MM-YYYY' ) )

	// 	appendPre( 'Upcoming events:' )

	// 	if ( events.length > 0 ) {
	// 		//Removes duplicate schedule items
	// 		events.filter((elem, index, arr) => arr.indexOf(elem) === index);

	// 		for ( let i = 0; i < events.length; i++ ) {
	// 			const event = events[ i ]
	// 			let when = event.start.dateTime
	// 			if ( !when ) {
	// 				when = event.start.date
	// 			}
	// 			//change start: dateTime: "2022-05-23T22:00:00+02:00" to usable date
	// 			const whenDate = moment( when ),
	// 				day = whenDate.format( 'DD-MM-YYYY' ),
	// 				match = dates.filter( d => d === day )[ 0 ]
	// 			//Sets item into calendar
	// 			if ( match ) {
	// 				// console.log('primary ', event);
	// 				addCalendarItem( event )
	// 			}
	// 			//Check <pre> in HTML
	// 			appendPre(event.summary + ' ( ' + when + ')' )
	// 		}
	// 	} else {
	// 		appendPre( 'No upcoming events found.' )
	// 	}
	// })

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
			//Add colors of all events
			calendarColors.push(event.colorId)
			// console.log('calendarcolor', calendarColors);
		
			allCalendarsThatWereGet.push(event.id)
			// console.log(allCalendarsThatWereGet);

			gapi.client.calendar.events.list({
					'calendarId': event.id,
					'timeMin': setMinimalDateEvents.toISOString(),
					'timeMax': setMaximalDateEvents.toISOString(),					
					'showDeleted': false,
					'singleEvents': true,
					// 'maxResults': 10,
					'orderBy': 'startTime'
				}).then( response => { 
					const eventsSec = response.result.items,
					//elWithDate = day columns
					elWithDateSec = document.querySelectorAll( '[data-date]' ),
					//Nodelist -> array
					elArrSec = Array.from( elWithDateSec ),
					//Makes dates of of data-date columns
					datesSec = elArrSec.map( d => moment( new Date( d.getAttribute( 'data-date' ) ) ).format( 'DD-MM-YYYY' ) )
					// console.log('eventsSec', eventsSec);
					if ( eventsSec.length > 0 ) {
						//Removes duplicate schedule items
						eventsSec.filter((elem, index, arr) => arr.indexOf(elem) === index);

						// console.log(allCalendarEvents);

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
							//Sets item of this week into calendar
							if ( match ) {
								// console.log('match', match);
								// console.log(datesSec);
								// console.log('secondary', event);
								addCalendarItem( event, i )
							}
							// allCalendarEvents.push(eventsSec)

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
			  googleCalendarColors = response.result.calendar
			}, function(error) {
			  console.error("Execute error", error);
			});
	}
	getColors();
}

function getMinutesAsHour(minuteValue) {
	if (minuteValue.minutes() !== 0) {
		return minuteValue.minutes() / 60;
	}
	else {
		return 0;
	}
}

//Gets and sets in local calendar
function addCalendarItem( obj ) {
	const div = document.createElement( 'div' ),
		fullDay = obj.start.date,
		startTime = obj.start.dateTime,
		date = fullDay || startTime,
		startToDate = moment( new Date( date ) ),
		target = document.querySelector( `[data-day='${ startToDate.format( 'D' ) }']` ),
		eventByProphecy = [];
	//After current week, query will fail

	if(obj.end) {
		if (obj.end.dateTime) {
			endTime = obj.end.dateTime
		} else {
			div.setAttribute('data-full-day', 'true')
			div.style="display: none"
			endTime = obj.end.date
		}
	} else {
		endTime = moment(obj.start.dateTime).add(1, 'hour')
	}
		// const endTime = obj.end.dateTime || moment(obj.start.dateTime).add(1, 'hour')	
	div.textContent = obj.summary ? obj.summary : '(Geen Titel)'
	
	var __startTime = moment(startTime).format();
	var __endTime = moment(endTime).format();
	var __duration = moment.duration(moment(__endTime).diff(__startTime));
	// var __hours = __duration.asHours();
	var __hours = __duration.hours() + ':' +  __duration.minutes();
	
	div.classList.add( 'item' )
	div.setAttribute( 'status', obj.status )

	// div.setAttribute( 'data-begin', startToDate.hours() )
	div.setAttribute( 'data-begin', startToDate.format('HH:mm') )
	var __endTimeHours = startToDate.hours() + __duration.hours()
	
	var __endTimeMinutes = startToDate.minutes() + __duration.minutes()
	if (__endTimeMinutes >= 60) {
		__endTimeMinutes -= 60
		__endTimeHours++
	}
	__endTime = __endTimeHours + ':' + __endTimeMinutes
	div.setAttribute('data-end', __endTime )
	// div.setAttribute( 'data-end', startToDate.hours() + ( __hours ? __hours : 1 ) )
	
	// if (startToDate.minutes() !== 0) {
	// 	var eventStartMinutes = startToDate.minutes() / 60;
	// }
	// else {
	// 	var eventStartMinutes = 0;
	// }
	// if (__duration.minutes() !== 0) {
	// 	var eventEndMinutes = __duration.minutes() / 60;
	// }
	// else {
	// 	var eventEndMinutes = 0;
	// }
	var eventLength = getMinutesAsHour(__duration) + __duration.hours();
	
	var eventStart = getMinutesAsHour(startToDate) + startToDate.hours();

	// div.setAttribute('data-end', __endTime.format('HH:mm') )
	div.style.top = !fullDay ? `calc( ( 100% / 23 ) * ${ eventStart - 1} )` : 0
	div.style.height = `calc( ( 100% / 23 ) * ${ eventLength ? eventLength : 1 } )`
	div.style.width = '90%';
	function setCalendarColor(parentCalendar) {
		const calendarNumberInArray = allCalendarsThatWereGet.indexOf(parentCalendar)
		return googleCalendarColors[calendarColors[calendarNumberInArray]].background
	}
	if (obj.organizer.email) {
		div.style.backgroundColor = setCalendarColor(obj.organizer.email);
	} else {
		div.style.backgroundColor = 'red'
	}

	div.style.backgroundColor = obj.colorId;

    if (obj.description) {
        //If the object is made by Prophecy
        if (obj.description.indexOf('Added by Prophecy Calendar') !== -1) {
            div.setAttribute('generatedByProphecy', '');

            const menuGroup = document.createElement('section');

            const cornerButton = document.createElement('button');
            menuGroup.setAttribute('data-show-popup', 'false')
            menuGroup.appendChild(cornerButton)
            div.appendChild(menuGroup)

            // cornerButton.addEventListener('mouseover', function() {
            //     // div.style.backgroundColor = "blue";
            // })
            cornerButton.addEventListener('click', popupForEventClick)

            eventByProphecy.push(div)
        }
    }

    if ( target ) {
		// console.log(target);
		target.appendChild( div )
	}
	// if (addToEventHolder === true)
	// {
	// 	//Creates an element with every item until deadline
	// 	const _makeDiv = document.querySelector('#eventHolder')
	// 	// Div or the event element needs to be cloned to append it twice
	// 	const div2 = div.cloneNode(true)

	// 	_makeDiv.appendChild(div2)
	// }
}

function objectToElementHolder(obj) {
	const div = document.createElement('div'),
		fullDay = obj.start.date,
		startTime = obj.start.dateTime,
		date = fullDay || startTime,
		startToDate = moment(new Date(date)),
		target = document.querySelector(`[data-day='${startToDate.format('D')}']`),
		eventByProphecy = [];
	//After current week, query will fail
	// console.log('startToDate, 509', startToDate.format('YYYY-MM-DD'));
	div.setAttribute('data-start-date', startToDate)
	//isSame()
	if (obj.end) {
		if (obj.end.dateTime) {
			endTime = obj.end.dateTime
		} else {
			div.setAttribute('data-full-day', 'true')
			div.style = "display: none"
			endTime = obj.end.date
		}
	} else {
		endTime = moment(obj.start.dateTime).add(1, 'hour')
	}
	// const endTime = obj.end.dateTime || moment(obj.start.dateTime).add(1, 'hour')	
	div.textContent = obj.summary ? obj.summary : '(Geen Titel)'

	var __startTime = moment(startTime).format();
	var __endTime = moment(endTime).format();
	var __duration = moment.duration(moment(__endTime).diff(__startTime));
	// var __hours = __duration.asHours();
	var __hours = __duration.hours() + ':' + __duration.minutes();

	div.classList.add('item')
	div.setAttribute('status', obj.status)

	// div.setAttribute( 'data-begin', startToDate.hours() )
	div.setAttribute('data-begin', startToDate.format('HH:mm'))
	var __endTimeHours = startToDate.hours() + __duration.hours()

	var __endTimeMinutes = startToDate.minutes() + __duration.minutes()
	if (__endTimeMinutes >= 60) {
		__endTimeMinutes -= 60
		__endTimeHours++
	}
	__endTime = __endTimeHours + ':' + __endTimeMinutes
	div.setAttribute('data-end', __endTime)
	var eventLength = getMinutesAsHour(__duration) + __duration.hours();

	var eventStart = getMinutesAsHour(startToDate) + startToDate.hours();

	div.style.top = !fullDay ? `calc( ( 100% / 23 ) * ${eventStart - 1} )` : 0
	div.style.height = `calc( ( 100% / 23 ) * ${eventLength ? eventLength : 1} )`
	div.style.width = '90%';
	function setCalendarColor(parentCalendar) {
		const calendarNumberInArray = allCalendarsThatWereGet.indexOf(parentCalendar)
		return googleCalendarColors[calendarColors[calendarNumberInArray]].background
	}
	if (obj.organizer.email) {
		div.style.backgroundColor = setCalendarColor(obj.organizer.email);
	} else {
		div.style.backgroundColor = 'red'
	}

	div.style.backgroundColor = obj.colorId;

	if (obj.description) {
		//If the object is made by Prophecy
		if (obj.description.indexOf('Added by Prophecy Calendar') !== -1) {
			div.setAttribute('generatedByProphecy', '');

			const menuGroup = document.createElement('section');

			const cornerButton = document.createElement('button');
			menuGroup.setAttribute('data-show-popup', 'false')
			menuGroup.appendChild(cornerButton)
			div.appendChild(menuGroup)

			// cornerButton.addEventListener('mouseover', function () {
			// 	div.style.backgroundColor = "blue";
			// })
			cornerButton.addEventListener('click', popupForEventClick)

			// eventByProphecy.push(div)
		}
	}

		//Creates an element with every item until deadline
		const _makeDiv = document.querySelector('#eventHolder')
		console.log('added', div);
		_makeDiv.appendChild(div)
		// checkDateAndAddToCalendar()
}

// function checkDateAndAddToCalendar() {
// 	const eventHolder = document.querySelector('#eventHolder'),
// 		  allHolderEvents = eventHolder.querySelectorAll('div'),
// 		  calendarView = document.querySelector('.agenda_time-row'),
// 		  allDaysOfCalendarView = calendarView.querySelectorAll('div')
	
// 	allHolderEvents.forEach( event => {
// 		const eventDate = moment(event.getAttribute('data-start-date'))

// 		for (let i = 0; i < allDaysOfCalendarView.length; i++) {
// 			if (eventDate.isSame(moment(allDaysOfCalendarView[i].getAttribute('data-date')), 'day')) {
// 				console.log('event and day', event, allDaysOfCalendarView[i]);
// 			}
			
// 		}
// 	})
// }

function makeThings() {
	// get today
	// if eventHolder contains div with startDate isSame as today
	// check differences etc
	// create object with todays date and times
	// else 
	// create object with todays and and wakeUptime + 1 --> maxHoursPerDay
	console.log('start of make things');
	const eventHolder = document.querySelector('#eventHolder'),
		  allHolderEvents = eventHolder.querySelectorAll('div')
	const deadline = moment(new Date(deadLineParameters[1]))

	const daysRemaining = Math.abs(Math.floor(moment().diff(moment(deadLineParameters[1]), 'days', true)))
	console.log('days remaining', daysRemaining);

	let day = 1
	console.log(deadline);
	for (let i = 0; i < daysRemaining; i++) {
		console.log(i < daysRemaining);
		console.log(day);
		const time = moment().add(day, 'day').hour(wakeUpTime).minute(0)
		const startToDate = moment(new Date(time))
		console.log(startToDate);
		// const currentDaySchedule = `[data-start-date='${startToDate.format('D')}']`
		// const currentDaySchedule = document.querySelector(`[data-day='${startToDate.format('D')}']`)
		// const currentDayInEventHolder = eventHolder.querySelectorAll(currentDaySchedule)
		
		//All items of today
		const currentDayScheduleItems = [];
		console.log(daysRemaining);
		eventHolder.querySelectorAll('[data-start-date]').forEach(element => {
			const elementDate = moment(element.getAttribute('data-start-date'))
			if (startToDate.isSame(elementDate, 'day') ) {
				console.log(day, element);
				console.log('this date has same day');
				currentDayScheduleItems.push(element)
			}
		})
		console.log(day, currentDayScheduleItems);
		// let hours
		// if (leftOver !== 0) {
		// 	hours = hoursPerDay + leftOver
		// 	leftOver = 0
		// } else {
		// 	hours = hoursPerDay
		// }
		// if (currentDaySchedule && currentDaySchedule.children.length > 0) {
		// 	const firstBegin = Number(currentDaySchedule.children[0].getAttribute('data-begin')),
		// 		maxEnd = Number(wakeUpTime) + hoursPerDay
		// 	if (maxEnd > firstBegin) {
		// 		leftOver = hours - (firstBegin - Number(wakeUpTime))
		// 		hours = firstBegin - Number(wakeUpTime)
		// 	}
		// }

		//fix for missing days of next weeks
		// if (currentDayScheduleItems <= 0) {
		// 	return
		// }]
		const currentDayScheduleItemTimes = [];

		if (currentDayScheduleItems.length > -1) {

			console.log(currentDayScheduleItems);
			//Makes an array of your scheduled times
			currentDayScheduleItems.forEach((agendaItem, i) => {
				// console.log('agenda item =', agendaItem);
				const agendaItemStart = timeToHourAndDecimal(agendaItem.getAttribute('data-begin'))
				const agendaItemEnd = timeToHourAndDecimal(agendaItem.getAttribute('data-end'))
				const agendaItemStartMinutes = getMinutesOfTime(agendaItem.getAttribute('data-begin'))
				const agendaItemEndMinutes = getMinutesOfTime(agendaItem.getAttribute('data-end'))
				currentDayScheduleItemTimes.push(Array(agendaItemStart, agendaItemEnd, agendaItemStartMinutes, agendaItemEndMinutes))
				console.log(agendaItem, i, currentDayScheduleItemTimes);
			})
			console.log(currentDayScheduleItemTimes);
			if (currentDayScheduleItemTimes.length > -1) {
				console.log('first item detected');
				// console.log((currentDayScheduleItemTimes[0][0] - 1) + ' - ' + (wakeUpTime + 1) + ' = ' + ( (currentDayScheduleItemTimes[0][0] - 1)  - (wakeUpTime + 1)));
				//If time of wake up and first scheduled item difference bigger than 3 hour, plan in 1 hour, 1hour for waking up 1hour for travel
				if (currentDayScheduleItemTimes[0]) {
					if ((currentDayScheduleItemTimes[0][0] - 1) - (wakeUpTime + 1) >= maxHoursPerDay){
						setAllAgendaEvents(day, wakeUpTime, 0, (wakeUpTime + maxHoursPerDay + 2), 0)
					}
					if ((currentDayScheduleItemTimes[0][0] - 1) - (wakeUpTime + 1) >= 1 && (currentDayScheduleItemTimes[0][0] - 1) - (wakeUpTime + 1) <= maxHoursPerDay) {
						console.log('first item function fired ');
						console.log(day, wakeUpTime, 0, (currentDayScheduleItemTimes[0][0] - 1), currentDayScheduleItemTimes[0][2]);
						//If there is 2 hours of time between first and second scheduled appointment
						setAllAgendaEvents(day, wakeUpTime, 0, currentDayScheduleItemTimes[0][0], currentDayScheduleItemTimes[0][3])
					}
				}
				//User doesnt have time before first scheduled appointment
				if (currentDayScheduleItemTimes[1]) {
					console.log('second item detected');
					//if start of second item > start of first item && end of second item < end of first item
					if (currentDayScheduleItemTimes[1][0] > currentDayScheduleItemTimes[0][0] && currentDayScheduleItemTimes[1][1] < currentDayScheduleItemTimes[0][1]) {
						console.log('intertwined events');
						return
					}
					if ((currentDayScheduleItemTimes[1][0] - 1) - (currentDayScheduleItemTimes[0][1] + 1) >= maxHoursPerDay) {
						setAllAgendaEvents(day, wakeUpTime, 0, (wakeUpTime + maxHoursPerDay + 2), 0)
					}
					//if start of second item and end of first item difference >= 2
					if ((currentDayScheduleItemTimes[1][0] - 1) - (currentDayScheduleItemTimes[0][1] + 1) >= 1 && (currentDayScheduleItemTimes[1][0] - 1) - (currentDayScheduleItemTimes[0][1] + 1) <= maxHoursPerDay) {
						//If there is 2 hours of time between first and second scheduled appointment
						console.log('schedule 0 - 1', currentDayScheduleItemTimes[1][0], currentDayScheduleItemTimes[0][1]);
						setAllAgendaEvents(day, currentDayScheduleItemTimes[0][1], currentDayScheduleItemTimes[0][2], (currentDayScheduleItemTimes[1][0]), currentDayScheduleItemTimes[1][3])
					}
					// else {
					// 	console.log('els');
					// 	return
					// }
				}
				//User doesnt have time before first scheduled appointment
				if (currentDayScheduleItemTimes[2]) {
					console.log('second item detected');
					//if start of second item > start of first item && end of second item < end of first item
					if (currentDayScheduleItemTimes[2][0] > currentDayScheduleItemTimes[1][0] && currentDayScheduleItemTimes[2][1] < currentDayScheduleItemTimes[1][1]) {
						console.log('intertwined events');
						return
					}
					//if start of second item and end of first item difference >= 2
					if ((currentDayScheduleItemTimes[2][0] - 1) - (currentDayScheduleItemTimes[1][1] + 1) >= 1) {
						//If there is 2 hours of time between first and second scheduled appointment
						console.log('schedule 1 - 2', currentDayScheduleItemTimes[2][0], currentDayScheduleItemTimes[1][1]);
						setAllAgendaEvents(day, currentDayScheduleItemTimes[1][1], currentDayScheduleItemTimes[1][2], (currentDayScheduleItemTimes[2][0]), currentDayScheduleItemTimes[2][3])
					}
					// else {
					// 	return
					// }
				}

				// if the ending time of the last item in agenda has a few hours until sleeptime
				if (currentDayScheduleItemTimes.length > -1) {
					if ((sleepTime - 1) - currentDayScheduleItemTimes[currentDayScheduleItemTimes.length - 1][1] >= 2) {
						// console.log('things');
						let maxEndAfterStart = sleepTime;

						if ((sleepTime - 1) - currentDayScheduleItemTimes[currentDayScheduleItemTimes.length - 1][1] > maxHoursPerDay) {
							maxEndAfterStart = currentDayScheduleItemTimes[currentDayScheduleItemTimes.length - 1][1] + maxHoursPerDay
						}
						setAllAgendaEvents(day, currentDayScheduleItemTimes[currentDayScheduleItemTimes.length - 1][1], currentDayScheduleItemTimes[currentDayScheduleItemTimes.length - 1][3], maxEndAfterStart, 0)
					}
				}
				else {
					//user doesnt have anything is his agenda for today
					console.log(day, wakeUpTime, 0, (wakeUpTime + maxHoursPerDay), 0);
					setAllAgendaEvents(day, wakeUpTime, 0, (wakeUpTime + maxHoursPerDay), 0)
				}

			}
		}
		// if (document.querySelectorAll(`[data-day='${startToDate.format('D')}']`)[0]) {
		// 	const currentDayColumn = document.querySelectorAll(`[data-day='${startToDate.format('D')}']`)[0]
		// 	if (!currentDayColumn.hasChildNodes) {
		// 		setAllAgendaEvents(day, wakeUpTime, 0, (wakeUpTime + maxHoursPerDay), 0)
		// 	}
		// }

		day++
		console.log('deeeeeeeeeeej', day);
		maxHoursPerDayForDeadline = maxHoursPerDay
	}
}

function popupForEventClick(event) {
	// this.removeEventListener('click', popupForEventClick)
	const parent = event.target.parentElement;

    if(parent.getAttribute('data-show-popup') === 'false') {
        parent.setAttribute('data-show-popup', 'true');
        if(!parent.querySelectorAll('.item-popup')[0]) {
            const popupMenu = document.createElement('div');
            popupMenu.classList.add('item-popup')

            parent.appendChild(popupMenu)

            const popupParent = event.target.parentElement;
            const popup = parent.querySelector('.item-popup');
            const replan = document.createElement('button');
            const cancel = document.createElement('button');
            replan.textContent = "Replan";
            cancel.textContent = "Cancel";
            popup.classList.add('item-popup');
            popup.appendChild(replan);
            popup.appendChild(cancel);
            replan.addEventListener('click', replanEvent);
            cancel.addEventListener('click', popupForEventClick)
            popupParent.appendChild(popup)
        }
    }
    else {
        parent.setAttribute('data-show-popup', 'false');
    }

}

function replanEvent(event) {
	console.log(event);

	showHidePopup(replanOverlay)
	document.querySelector('#replan-confirmed').addEventListener('click', function () {
		showHidePopup(replanOverlay)
		TweenMax.to(event.target.parentElement.parentElement.parentElement, 0.4, {
			opacity: 0,
			ease: Quint.easeOut
		});
	})
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
	
	// 	options.end.dateTime = obj.end.dateTime.add( 1, 'hour' )._d
	
	// } else if ( options.end.date ) {
	
	// 	options.end.date = obj.end.date.add( 1, 'hour' )._d
	
	// } else {
	
	// 	if ( obj.start.dateTime ) {
	
	// 		options.end.dateTime = obj.start.dateTime.add( 1, 'hour' )._d
	
	// 	} else {
	
	// 		options.end.date = obj.start.date.add( 1, 'hour' )._d
	
	// 	}
	
	// }

	// gapi.client.calendar.events.insert({
	// 	'calendarId': 'primary',
	// 	'resource': options
	// }).then( response => {

	// 	console.log( response )

	// }).catch( err => {

	// 	console.log( err )

	// })

}

const deadlineSubmit = document.querySelector('.deadline-submit');
const deadlineTitle = document.querySelector('#deadline-title');
const deadlineEndDate = document.querySelector('#deadline-enddate');
const deadlineHours = document.querySelector('#deadline-hours');
const deadLineParameters = [];
deadlineSubmit.addEventListener('click', getDeadline)

let wakeUpTime = 6; //get input[name="wakeUpTime"].value
let sleepTime = 23; //get input[name="sleepTime"].value
let maxHoursPerDay = 8; //get input[name="maxHours"].value
// let setMaximalDateEvents = new Date();
// setMaximalDateEvents.setDate(setMaximalDateEvents.getDate() + (365 / 4))

function getEventsBeforeDeadline(_deadlineEndDate) {
	const newDeadlineDate = new Date(_deadlineEndDate)
	const tomorrow = new Date()
	// tomorrow.setDate(tomorrow.getDate() + 1)

	gapi.client.calendar.calendarList.list({
		'calendarId': 'secondary',
		'timeMin': tomorrow.toISOString(),
		'timeMax': newDeadlineDate.toISOString(),
		'showDeleted': false,
		'singleEvents': true,
		// 'maxResults': 10,
		'orderBy': 'startTime'
	}).then(response => {
		//All items that were fetched
		agenda = response.result.items
		const events = response.result.items,
			//elWithDate = day columns
			elWithDate = document.querySelectorAll('[data-date]'),
			//Nodelist -> array
			elArr = Array.from(elWithDate),
			//Makes dates of of data-date columns
			dates = elArr.map(d => moment(new Date(d.getAttribute('data-date'))).format('DD-MM-YYYY'))

		// console.log( 'dates', dates )
		appendPre('Upcoming events:')

		// console.log('events', events )
		events.forEach((event, i) => {
			gapi.client.calendar.events.list({
				'calendarId': event.id,
				'timeMin': tomorrow.toISOString(),
				'timeMax': newDeadlineDate.toISOString(),
				'showDeleted': false,
				'singleEvents': true,
				// 'maxResults': 10,
				'orderBy': 'startTime'
			}).then(response => {
				const eventsSec = response.result.items,
					//elWithDate = day columns
					elWithDateSec = document.querySelectorAll('[data-date]'),
					//Nodelist -> array
					elArrSec = Array.from(elWithDateSec),
					//Makes dates of of data-date columns
					datesSec = elArrSec.map(d => moment(new Date(d.getAttribute('data-date'))).format('DD-MM-YYYY'))
				// console.log('eventsSec', eventsSec);
				if (eventsSec.length > 0) {
					console.log(eventsSec);
					for (let i = 0; i < eventsSec.length; i++) {
						const event = eventsSec[i]
						let when = event.start.dateTime
						if (!when) {
							when = event.start.date
						}
						// console.log(event.summary, when);
						allCalendarEvents.push(event)
						objectToElementHolder(event)
					}
					console.log('added all to object element aka #elementHolder');
					console.log('now making things');
					makeThings()
					
					// getStartEndOfEvents()
				} else {
					appendPre('No upcoming events found.')
				}
			})
		})
	})

}

function timeToHourAndDecimal(time) {
	const hour = Number(time.substring(0, time.indexOf(':')))

	const minute = Number(time.substring(time.indexOf(':') + 1,time.length))

	const minuteAsPartOfHour = minute / 60;
	return hour + minuteAsPartOfHour
}

function getMinutesOfTime(time) {
	const minute = Number(time.substring(time.indexOf(':') + 1, time.length))
	return minute
}


let previousDay;
let previousMaxHoursPerDayForDeadline
function setAllAgendaEvents(day, start, startMinutes, end, endMinutes ) {
	console.log('setAllAgendaEvents ', day, start, startMinutes, end, endMinutes);
	const time = moment().add(day, 'day').hour(wakeUpTime).minute(0)
	const startToDate = moment(new Date(time))
	console.log('starttodate', startToDate.format('D'));

	maxHoursPerDayForDeadline = maxHoursPerDay;

	// Set margin for wake up time and bed time
	// if (currentDaySchedule.querySelectorAll('[data-begin]')[0]) {
	// 	end -= 1
	// }
	// else {
	// 	end += 1
	// }

	// console.log('check', day, start, startMinutes, end, endMinutes);
	// console.log('start of event', start);
	let startTime = moment().add(day, 'day').hour(start + 1).minute(startMinutes)
	let endTime = moment().add(day, 'day').hour(end - 1).minute(endMinutes)

	// let startTimeAsNumber = timeToHourAndDecimal(startTime.format('HH:mm'))
	// let endTimeAsNumber = timeToHourAndDecimal(endTime.format('HH:mm'))

	// if (endTimeAsNumber - startTimeAsNumber > maxHoursPerDayForDeadline ) {
	// 	endTime = startTime.add(maxHoursPerDayForDeadline, 'hours')
	// }
	
	const o = {
		summary: `Working on ${deadLineParameters[0]}`,
		start: {
			// date: moment().add( day, 'day' )
			dateTime: startTime
		},
		end: {
			dateTime: endTime
		},
		organizer: {
			email: ''
		},
		description: 'Added by Prophecy Calendar',
		colorId: 9,
		status: 'confirmed'
	}
	// console.log(o);

	// startTime = o.start.dateTime
	// endTime = o.end.dateTime
	// console.log(startTime, endTime);
	const timeOfEvent = Math.abs(startTime.diff(endTime, 'hours', true))
	console.log('time of event', timeOfEvent);
	hoursNeededForDeadline -= timeOfEvent
	maxHoursPerDayForDeadline -= timeOfEvent

	// const timeOfEvent = timeToHourAndDecimal((end - (start + 1)) + ':' + (endMinutes - startMinutes));
	console.log('hoursNeededForDeadline after ', hoursNeededForDeadline);
	// console.log('event added: ', o);
	if (day === previousDay) {
		console.log(day, previousDay);
		previousMaxHoursPerDayForDeadline -= timeOfEvent;
	}
	else {
		previousMaxHoursPerDayForDeadline = maxHoursPerDayForDeadline;
	}

	if (maxHoursPerDayForDeadline <= 0 || previousMaxHoursPerDayForDeadline <= 0) {
		console.log('maxHours', day, maxHoursPerDayForDeadline);
		day++
	}

	previousDay = day

	if (hoursNeededForDeadline <= 0 /*|| maxHoursPerDayForDeadline <= 0*/) {
		return
	}
	else {
		console.log('made deadline object', o);
		allCreatedDeadlineObjects.push(o)
		console.log(hoursNeededForDeadline);
		objectToElementHolder(o)
		addCalendarItem(o)
	}
}
function flatten(arr) {
	return arr.reduce(function (flat, toFlatten) {
		return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
	}, []);
}

// function getStartEndOfEvents() {
// 	//Sorts the living shit out of this array, ASC from start date
// 	allCalendarEvents.sort(function (a, b) {
// 		return new Date(a.start.dateTime) - new Date(b.start.dateTime);
// 	});
	
// 	console.log(allCalendarEvents);
// 	createDeadlineObjects()
// }

let allCreatedDeadlineObjects = []

// function createDeadlineObjects() {
// 	/*
// 	Get wake up time
// 	Get sleep time
// 	Get all start and end times of allCalendarEvents
// 	Add hour margin to each value
// 	Get difference, wake up & first object
// 	Set max hours
// 	Add item
// 	Save added items to localStorage or database

// 	Make previous and next a function not a new page
// 	*/
// 	let currentDay = 1
// 	let time = moment().add(currentDay, 'day').hour(wakeUpTime).minute(0)
// 	let startToDate = moment(new Date(time))
// 	const currentDaySchedule = document.querySelector(`[data-day='${startToDate.format('D')}']`)
// 	// const currentDaySchedule = allCalendarEvents[currentDay]
// 	maxHoursPerDayForDeadline = maxHoursPerDay;
// 	//HoursNeedForDeadline is declared
// 	wakeUpTime = wakeUpTime + 1
// 	sleepTime = sleepTime - 1

// 	// console.log(currentDay);
// 	// console.log(time);
// 	// console.log(startToDate);
// 	console.log(currentDaySchedule);
// 	let dayOfEvents
// 	//Difference between startDate and deadline
// 	let daysRemaining = Math.abs(Math.floor(time.diff(moment(deadLineParameters[1]), 'days', true)))
// 	console.log('days remaining', daysRemaining);
// 	for (let i = 1; i < (daysRemaining + 1); i++) {
// 		allCalendarEvents.forEach((event, index) => {
// 			dayOfEvents = moment().add(index, 'day').hour(wakeUpTime).minute(0)
// 			dayOfEvents = dayOfEvents.format('D')

// 			let when = event.start.dateTime
// 			if (!when) {
// 				when = event.start.date
// 			}
// 			let whenEnd = event.end.dateTime
// 			if (!whenEnd) {
// 				whenEnd = event.end.date
// 			}
// 			const googleCalendarEventDateConverted = moment(when).format('YYYY-MM-DD')
// 			// console.log(googleCalendarEventDateConverted, startToDate.format('YYYY-MM-DD'));
// 			let eventTimeStart = event.start.dateTime
// 			let eventTimeEnd = event.end.dateTime
// 			eventTimeStart = moment(event.start.dateTime).format('HH:mm')
// 			eventTimeEnd = moment(event.end.dateTime).format('HH:mm')

// 			if (startToDate === googleCalendarEventDateConverted) {
// 				console.log('date has event', event);
// 				//this date has an event
// 				let eventTimeStart = event.start.dateTime
// 				let eventTimeEnd = event.end.dateTime
// 				eventTimeStart = moment(event.start.dateTime).format('HH:mm')
// 				eventTimeEnd = moment(event.end.dateTime).format('HH:mm')
// 				console.log(eventTimeStart, eventTimeEnd);
// 				const agendaItemStartMinutes = getMinutesOfTime(eventTimeStart)
// 				const agendaItemEndMinutes = getMinutesOfTime(eventTimeEnd)
// 				//When there is more than 3 hours available between wake up and first appointment
// 				if (wakeUpTime - timeToHourAndDecimal(eventTimeStart) < 3 ) {
// 					// setAllAgendaEvents(currentDay, eventTimeStart, agendaItemStartMinutes, eventTimeEnd, agendaItemEndMinutes)
// 				}
// 			}
// 			else {
// 				//no events this date
// 				setAllAgendaEvents(dayOfEvents, wakeUpTime, 0, wakeUpTime + maxHoursPerDayForDeadline, 00)
// 			}
// 		})
// 	}
// }

// New re-written function
function getDeadline() {
	//Creates an array of the deadline
	// deadLineParameters.push(deadlineTitle.value, deadlineEndDate.value, deadlineHours.value)
	// hoursNeededForDeadline = deadLineParameters[2]
	// console.log(hoursNeededForDeadline)
	// //Hides the deadlineOverlay popup
	showHidePopup(deadlineOverlay)

	deadLineParameters.push(deadlineTitle.value, deadlineEndDate.value, deadlineHours.value)
	hoursNeededForDeadline = deadLineParameters[2]

	console.log(hoursNeededForDeadline)

	const deadlineEndDateFormatted = moment(deadlineEndDate.value)

	console.log(deadlineEndDate.value);

	getEventsBeforeDeadline(deadlineEndDate.value)

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

let preferenceOverlayGroup = [];
preferenceOverlayGroup.push(preferenceButton, preferenceOverlayClose, preferenceOverlayBackground)
console.log(preferenceOverlayGroup);
preferenceOverlayGroup.forEach(function (elem) {
	elem.addEventListener('click', function () {
		showHidePopup(preferenceOverlay);
	});
})

let replanOverlayGroup = [];
replanOverlayGroup.push(replanButton, replanOverlayClose, replanOverlayBackground)
console.log(replanOverlayGroup);
replanOverlayGroup.forEach(function (elem) {
	elem.addEventListener('click', function () {
		showHidePopup(replanOverlay);
	});
})

// const agenda = document.querySelector('.agenda');
