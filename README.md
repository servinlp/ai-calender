# Prophecy

Prophecy is a calendar web app that plans deadlines and project for you.

  - Uses Google Calendar API
  - Downloadable as an app
  - Gets to know your schedule

# Features!

  - Creates a schedule for you
    - Set the name of the project
    - Day of deliverance
    - Amount of hours needed
  
## That's it.

By using smart functions the calendar will get to know you via Push Notifications.
After a while the calendar will know when you are able to work optimally and it will create a schedule around your busy hours.


> The project started because we ourselves are not able to manage time
> Because time management is hard.

# Tech

Prophecy uses:

* HTML, CSS, JavaScript
* PouchDB
* A few Google APIs

And of course Prophecy is open source on GitHub.

# To do

## Design
- Create mobile friendly appearance
- Responsive design
- Splashpage
- Preference window

## Front end

### JS
- Split up JS files, new architecture
- Improve self planning feature
- Add more web app functions like:
  - push notifications
  - installation
  - caching
- Create 'time running out!' notification
- Create priority per project

### CSS
- Create responsive design
- Maybe switch to `display: grid;`

### Animation
- Animate everything.

## Back-end
- Offline usage (pouchDB)
- Caching
- Fetch Google Calendar events serverside via Express (API Key serverside)
- Cross Device usage (pouchDB)
- Save preferences, created events, priority
