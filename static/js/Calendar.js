// ******************** Initialize Calendar Event List ********************
let calendarEvents = document.getElementById('calendarEventsVariable').innerHTML; //Get passed list
//of calendar events
calendarEvents = calendarEvents.replaceAll('\'', '\"'); //Replace python quotes with JSON quotes
calendarEvents = calendarEvents.replaceAll('None', 'null'); //Replace Python None with JSON null
calendarEvents = JSON.parse(calendarEvents); //Convert python string to JSON
drawCalendar(events);

function drawCalendar(events){
// ******************** Draw Calendar ********************
var calendarEl = document.getElementById('calendar'); //Reference calendar html element
var calendar = new FullCalendar.Calendar(calendarEl, { //Constructor for calendar js object
  initialView: 'dayGridWeek', //Set to week view
  events: calendarEvents, //Set calendar js events to passed events list
  eventClick: function(info){ //Event listener definition: When an event is clicked, go to edit event page
    let currentEventID = 1; 
    currentEventID = info?.event?.id; //Get clicked event's id to pass to python edit_event function
    let newUrl = "[[=URL('edit_event', 'currentEventID', signer=url_signer)]]"; //URL for routing to python edit_event function
    
    //With updated event id
    newUrl = newUrl.replace('currentEventID', currentEventID); //Add clicked event's id to URL
    document.getElementById('editEventButton').href = newUrl; //Assign updated URL to button href
    console.log(document.getElementById('editEventButton').href);
    console.log("Clicking")
    document.getElementById('editEventButton').click(); //Click edit event button to call python edit_event function
  }
});
calendar.render(); //Render the initialized calendar
}