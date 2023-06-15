
function getFormattedDate(dateTime){
  if(dateTime === null){
    return null;
  }
  if(typeof dateTime === 'string'){
    dateTime = new Date(dateTime);
  }
  const curMonth = dateTime.getMonth() + 1;
  return curMonth + "-" + dateTime.getDate() + "-" + dateTime.getFullYear();
}

function drawProductivityBar(events){
  //Time Marker
  const timeMarker = document.createElement('div');
  timeMarker.style= "position: absolute; width: 50px; min-height: 200px; margin: 0.5px; color: black; font-size: 12px;";
  //Single progress strip
  const intervalBar = document.createElement('div');
  intervalBar.style= "position: absolute; background: lime; width: 0.25px; min-height: 200px; margin: 0.5px; ";
  //Single Event
  const eventStrip = document.createElement('div');
  eventStrip.style = "position: relative; background: rgba(0,0,255,0.5); min-height: 200px; margin: 0.5px; border-radius: 5%; word-wrap: break-word; color: black;";



  //Current Date
  let curDate = new Date();
  curDate = getFormattedDate(curDate); 
  //console.log(curDate);
  
  let curTime = new Date();
  curTime = ((curTime.getHours() * 60) + curTime.getMinutes()) / 1440;

  //Filter today's events
  events = events.filter(event => getFormattedDate(event.start) == curDate);
  //console.log(events)
  const productivityBar = document.getElementById("productivity-bar"); //Reference whole productivity bar
  //Add time increment lines
  productivityBar.innerHTML = "";
  //Add productivity strips
  for(let i=0;i<288;i++){
    //Time Markers
    if (i % 12 == 0){
      const newTimeMarker = timeMarker.cloneNode(true);
      newTimeMarker.innerHTML = (i/12) + "";
      newTimeMarker.style.left = ((i/288)*100) + "%";
      productivityBar.appendChild(newTimeMarker);
    }
    //Interval Strips
    let barColor = (i/288) >= curTime? "lime" : "red"; //decide block color
    const newIntervalBar = intervalBar.cloneNode(true); 
    
    newIntervalBar.style.background = barColor;
    newIntervalBar.style.left = ((i/288)*100) + "%";
    productivityBar.appendChild(newIntervalBar);
  }
  //Add event strips
  for(let i=0; i<events.length;i++){
    const newEventStrip = eventStrip.cloneNode(true); //Div for event strip
    //Event title text on strip
    newEventStrip.innerHTML = events[i]?.title; 
    //Event completion color
    console.log(events[i]?.completion_time)
    if(events[i]?.completion_time !== undefined){
      newEventStrip.style.background = "rgba(170,255,0,0.5)"; 
    }

    //Calculate start time bar percentage
    let eventStartMins = new Date(events[i]?.start);
    if(eventStartMins !== null){
      eventStartMins = (eventStartMins.getHours() * 60) + eventStartMins.getMinutes();
      eventStartMins = eventStartMins / 1440;
    }
    //Calculate end time bar percentage
    let eventEndMins = new Date(events[i]?.end);
    //Get end of day Date
    let endOfDay = new Date();
    endOfDay.setHours(23);
    endOfDay.setMinutes(59);
    endOfDay.setSeconds(0);
    //Limit event bar to end of day
    eventEndMins = new Date(Math.min(eventEndMins, endOfDay));
    if(eventEndMins !== null){
      eventEndMins = (eventEndMins.getHours() * 60) + eventEndMins.getMinutes();
      eventEndMins = eventEndMins / 1440;
    }
    //Calculate strip width (event length)
    const stripWidth = eventEndMins - eventStartMins;
    //Calculate strip begin (start time)
    const stripBegin = eventStartMins * 100;

    //console.log(stripWidth*100);
    newEventStrip.style.position = "absolute";
    newEventStrip.style.width = (stripWidth*100) + "%";
    newEventStrip.style.left = stripBegin + "%";
    productivityBar.appendChild(newEventStrip);
  }
}