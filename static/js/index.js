


// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    // **************************************************************************
    // ****************************** App Initialization Setup ******************************
    // **************************************************************************
    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        event_query: "",
        events: [], //Search results list
        all_events: [],
        completed_setting: "all_events",
        minutes_completed: 0,
        current_date: new Date().toLocaleDateString(),
        elements: [],
        edit_event_href : "[[=URL('edit_event', 1, signer=url_signer)]]",
        document: document,
    };    
    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };    
    
    // **************************************************************************
    // ****************************** Get Events ******************************
    // **************************************************************************
    app.get_events = function (){
        // ****************************** Get Filtered Events According to Setting ******************************
        axios.get(get_events_url, {params: {setting: app.data.completed_setting, date: app.data.current_date}}) //Query python backend (GET, passing query)
            .then(function(result){ //Using the result from python's "get_events_url",
                let result_events = result.data.results; //Initial event list result from python controller
                for(let i=0;i<result_events.length;i++){ 
                    let completion_time = result_events[i].completion_time !== null ?
                    new Date(result_events[i].completion_time).toLocaleString() :
                    result_events[i].completion_time
                    result_events[i] = { //
                        "id": result_events[i].id,
                        "title": result_events[i].title,
                        "user_email": result_events[i].user_email,
                        "due_time": new Date(result_events[i].due_time).toLocaleString(),
                        "start": new Date(result_events[i].start).toLocaleString(), 
                        "end": new Date(result_events[i].end).toLocaleString(), 
                        "description": result_events[i].description,
                        "completion_time": completion_time,
                    }
                }
                app.data.events = result_events;//result.data.results //Assign the list of results to the response
                app.drawProductivityBar(app.data.events);
                app.drawCalendar();
                app.draw_cal_prod();

                let listString = ""
                if(app.data.completed_setting === "your_events" || app.data.completed_setting === "your_completed" || app.data.completed_setting === "your_uncompleted"){
                    listString = " Your"
                }
                
                else if(app.data.completed_setting.includes("@")){
                    listString = " " + app.data.completed_setting + "'s";
                }
                else{
                    listString = " Group"
                }
                document.getElementById("task-list-heading").innerHTML = listString + " Tasks" ;
            })
            // ****************************** Get all events, for calendar******************************
            axios.get(get_all_events_url, {params: {}}) //Query python backend (GET, passing query)
            .then(function(result){ //Using the result from python's "get_events_url",
                let result_events = result.data.results; //Initial event list result from python controller
                for(let i=0;i<result_events.length;i++){ 
                    let completion_time = result_events[i].completion_time !== null ?
                    new Date(result_events[i].completion_time).toLocaleString() :
                    result_events[i].completion_time
                    result_events[i] = { //
                        "id": result_events[i].id,
                        "title": result_events[i].title,
                        "user_email": result_events[i].user_email,
                        "due_time": new Date(result_events[i].due_time).toLocaleString(),
                        "start": new Date(result_events[i].start).toLocaleString(), 
                        "end": new Date(result_events[i].end).toLocaleString(), 
                        "description": result_events[i].description,
                        "completion_time": completion_time,
                    }
                }
                app.data.all_events = result_events;//result.data.results //Assign the list of results to the response
                app.drawCalendar();
            })
            // ****************************** Get Today's Productivity ******************************
            app.get_minutes_completed(new Date(app.data.current_date), app.data.completed_setting).then(res => {
                        app.data.minutes_completed = res;
                    }
                )
            //app.draw_cal_prod();
    }

    // ****************************** Edit Event ******************************
    app.edit_event = async function(event_id, url_signer){
        window.location.href = "../edit_event/" + event_id ;//+ "?_signature=" + url_signer;
        return res.data.results;
    }
    // ****************************** Delete Event ******************************
    app.delete_event = async function(event_id){
        let res = await axios.get(delete_event_url, {params: {event_id: event_id}});
        app.get_events()
        return res.data.results;
    }
    // ****************************** Set Completed Setting ******************************
    //Changes the setting for which events are listed according to which button is pressed.
    app.set_completed_setting = function (new_setting){
        app.data.completed_setting = new_setting; //Change completed_setting variable
        app.get_events(); //Reload meow listing
    }
    // ****************************** Set Completed ******************************
    app.set_completed = function (event){
        axios.post(set_completed_url, //
            {
                event_id: event.id
            }
            ).then(function(response){
                app.get_events();
            })
    }
    // ****************************** Get Minutes Completed ******************************
    app.get_minutes_completed = async function(date, user){
        let res = await axios.get(get_minutes_url, {params: {date: date, user: user}});
        return res.data.results;
    }   

    // **************************************************************************
    // ****************************** Calculate Productivity ******************************
    // **************************************************************************
    app.calcProductivity = function(){
        setInterval(function(){
            let curTime = (new Date());
            let totalSeconds = (24*60*60)//(curTime.getHours() * 60 * 60) + (curTime.getMinutes() * 60) + (curTime.getSeconds())
            let completedString = ""
            if(app.data.completed_setting === "your_events" || app.data.completed_setting === "your_completed" || app.data.completed_setting === "your_uncompleted"){
                completedString = " Your"
            }
            
            else if(app.data.completed_setting.includes("@")){
                completedString = " " + app.data.completed_setting + "'s";
            }
            else{
                completedString = " Group"
            }
            if(curTime.toLocaleDateString() == app.data.current_date){
                document.getElementById("productivity-bar-heading").innerHTML = app.data.current_date + completedString + " Productivity: " +  ((((app.data.minutes_completed*60) / totalSeconds)*100).toFixed(2)) + "%";
            }
            else{
                document.getElementById("productivity-bar-heading").innerHTML = app.data.current_date + completedString + " Productivity: " +  ((((app.data.minutes_completed*60) / (24*60*60))*100).toFixed(2)) + "%";
            }
            //drawProductivityBar(app.data.events);
          }, 1000);
    }
    // **************************************************************************
    // ****************************** Draw Calendar Productivity Headings ******************************
    // **************************************************************************
    app.draw_cal_prod = function(){
        // ******************** Calendar Daily Productivities ********************
        // Box containing daily productivities
        // Get calendar's dates
        headers = document.getElementsByClassName("fc-col-header-cell-cushion");
        // Template daily productivity label element
        const dailyProd = document.createElement('div');
        dailyProd.style= "margin: 0.5px; color: black; font-size: 16px;";
        // Get and Draw daily productivities
        for(let i=0;i<app.data.elements.length;i++){
            app.data.elements[i].remove();
        }
        // Draw daily productivities
        for(let i=0;i<headers.length;i++){
            let calendarDate = new Date(headers[i].getAttribute("aria-label"));
            app.get_minutes_completed(calendarDate, app.data.completed_setting).then(res => {

                        const newDailyProd = dailyProd.cloneNode(true);
                        app.data.elements.push(newDailyProd);
                        newDailyProd.innerHTML += ((res/(24*60))*100).toFixed(2) + "%";
                        headers[i].appendChild(newDailyProd);
                    }
                )
        }
    }
    // **************************************************************************
    // ****************************** Draw Calendar ******************************
    // **************************************************************************
    app.drawCalendar = function (){
        let calendarEvents = app.data.all_events.slice(); //Get current list
        let eventIds = []
        for(let i=0;i<app.data.events.length;i++){
            eventIds.push(app.data.events[i].id)
        }
        for(let i=0;i<calendarEvents.length;i++){
            // Completed
            let eventColor = calendarEvents[i].completion_time ? "rgba(0,255,0, 0.2)" : "rgba(0,0,255,0.1)";
            // Currently inspected event
            if (eventIds.includes(calendarEvents[i].id)){
                eventColor = calendarEvents[i].completion_time ? "rgba(0,255,0, 1)" : "rgba(0,0,255,1)";
            }
            //Uncompleted, past due
            if(!calendarEvents[i].completion_time && new Date(calendarEvents[i].due_time) < new Date()){
                eventColor = eventIds.includes(calendarEvents[i].id) ? "rgba(255,0,0, 1)" : "rgba(255,0,0,0.2)";
            }
            //eventColor = 
            calendarEvents[i] = {
                id: calendarEvents[i].id,
                start: new Date(calendarEvents[i].start),
                end: new Date(calendarEvents[i].end),
                title: calendarEvents[i].title,
                color: eventColor,
                textColor: eventColor,
                //backgroundColor: eventColor,
            }
        }
        //of calendar events
        // calendarEvents = calendarEvents.replaceAll('\'', '\"'); //Replace python quotes with JSON quotes
        // calendarEvents = calendarEvents.replaceAll('None', 'null'); //Replace Python None with JSON null
        // calendarEvents = JSON.parse(calendarEvents); //Convert python string to JSON
        // ******************** Draw Calendar ********************
        var calendarEl = document.getElementById('calendar'); //Reference calendar html element
        var calendar = new FullCalendar.Calendar(calendarEl, { //Constructor for calendar js object
          initialView: 'dayGridWeek', //Set to week view
          initialDate: new Date(app.data.current_date),
          selectable: false,
          events: calendarEvents, //Set calendar js events to passed events list
          eventClick: function(info){ //Event listener definition: When an event is clicked, go to edit event page
            app.data.current_date = info?.event?.start.toLocaleDateString();
            app.data.completed_setting = info?.event?.id //Set currently viewed events to clicked event only
            app.get_events();

          },
          dateClick: function(info){
            app.data.current_date = info?.date.toLocaleDateString();
            app.data.completed_setting = info?.dateStr; //Set currently viewed events to clicked date only
            app.get_events();
            // $(".fc-state-highlight").removeClass("fc-state-highlight");
            // $(jsEvent.target).addClass("fc-state-highlight");
            //app.data.current_date = 
          },
        });
        calendar.render(); //Render the initialized calendar
        }

    // **************************************************************************
    // ****************************** Draw Productivity Meter ******************************
    // **************************************************************************
    app.drawProductivityBar = function (){
        // ****************************** Element Initialization ******************************
        //Time Marker element template
        const timeMarker = document.createElement('div');
        timeMarker.style= "position: absolute; width: 50px; min-height: 200px; margin: 0.5px; color: black; font-size: 12px;";
        //Single progress strip element template
        const intervalBar = document.createElement('div');
        intervalBar.style= "position: absolute; background: lime; width: 0.25px; min-height: 200px; margin: 0.5px; ";
        //Single Event element template
        const eventStrip = document.createElement('div');
        eventStrip.style = "position: relative; background: rgba(0,0,255,0.7); min-height: 200px; margin: 0.5px; border-radius: 5%; word-wrap: break-word; color: black; font-family: Helvetica; font-weight: 400;";
        // ****************************** Get Current Time ******************************
        curDate = app.data.current_date;
        //Get current time used if today selected
        let curTime = new Date();
        if(curTime.toLocaleDateString() == app.data.current_date){
            curTime = ((curTime.getHours() * 60) + curTime.getMinutes()) / 1440;
        }
        //Other date selected, will draw lines only one color
        else if(new Date(app.data.current_date) < curTime){ //Past date selected
            curTime = 1440;
        }
        else { //Future date selected
            curTime = 0;
        }
        // ****************************** Filter Events for Selected Day ******************************
        events = app.data.events.filter(event => (new Date(event.start)).toLocaleDateString() == curDate);
        //Reference whole productivity bar for adding elements
        const productivityBar = document.getElementById("productivity-bar"); 
        //Add time increment lines
        productivityBar.innerHTML = "";
        // ****************************** Draw Time Lines and Intervals ******************************
        for(let i=0;i<288;i++){
          //Time Markers
          if (i % 12 == 0){
            const newTimeMarker = timeMarker.cloneNode(true);
            newTimeMarker.innerHTML = (i/12) + "";
            newTimeMarker.style.left = ((i/288)*100) + "%";
            newTimeMarker.onclick = function(event){
                app.set_completed_setting("all_events")
                //app.get_events()
            }
            productivityBar.appendChild(newTimeMarker);
          }
          //Interval Strips
          let barColor = (i/288) >= curTime? "lime" : "red"; //decide block color
          const newIntervalBar = intervalBar.cloneNode(true); 
          
          newIntervalBar.style.background = barColor;
          newIntervalBar.style.left = ((i/288)*100) + "%";
          productivityBar.appendChild(newIntervalBar);
        }
        // ****************************** Draw Event Blocks ******************************
        for(let i=0; i<events.length;i++){
          const newEventStrip = eventStrip.cloneNode(true); //Div for event strip
          //newEventStrip.id = events[i]?.id
          newEventStrip.class = events[i]?.user_email
          newEventStrip.onclick = function(event){
            app.set_completed_setting(event?.target?.class)
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
          let endOfDay = new Date(app.data.current_date);
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
            //Event title text on strip
            if(stripWidth >= 0.05){
                newEventStrip.innerHTML = events[i]?.user_email + " - "; 
                newEventStrip.innerHTML += events[i]?.title; 
            }
            //Event completion color
            if(events[i]?.completion_time){
                newEventStrip.style.background = "rgba(0,255,0,0.5)"; 
            }
            //Incomplete overdue event
            else if(events[i]?.due_time){
                if(new Date(events[i]?.due_time) < new Date()){
                    newEventStrip.style.background = "rgba(255,0,0,0.5)"; 
                }
            }
          newEventStrip.style.position = "absolute";
          newEventStrip.style.width = (stripWidth*100) + "%";
          newEventStrip.style.left = stripBegin + "%";
          productivityBar.appendChild(newEventStrip);
        }
        // ****************************** Productivity Graph Line ******************************
        //Line dot element template
        let lineDiv = document.createElement("div");
        lineDiv.style = "position: absolute; min-height: 1px; min-width: 1px; top: 200px; background: black;";
        //Percent Marker
        const percentMarker = document.createElement('div');
        percentMarker.style= "position: absolute; width: 50px; min-height: 200px; margin: 0.5px; color: black; font-size: 12px;";
        //Draw Percent Markers
        for(let i=0;i<=100;i++){
            if (i % 10 == 0){
                const newPercentMarker = percentMarker.cloneNode(true);
                newPercentMarker.innerHTML = (i) + "%";
                newPercentMarker.style.top = 39 - (i/4) + "%";
                productivityBar.appendChild(newPercentMarker);
            }
        }
        //Initialize productivity graph data
        let curProd = [];
        for(let i=0;i<(24*60);i++){
            curProd.push(0);
        }
        //Calculate absolute productivity graph from today's events
        for(let i=0;i<events.length;i++){ //for each event today
            if(events[i]['completion_time']){ //If completed event
                let startMin = (new Date(events[i]['start']).getHours()) * 60;
                startMin += (new Date(events[i]['start']).getMinutes()); //productivity graph start index in minutes
                let endMin = (new Date(events[i]['end']).getHours()) * 60;
                endMin += (new Date(events[i]['end']).getMinutes()); //productivity graph end index in minutes
                for(let j=startMin;j<endMin;j++){ //for each minute in completed event
                    curProd[j] = curProd[j] + (1/(24*60)) //Add full productivity to currently iterated minute
                }
            }
        }
        //Calculate cumulative productivity graph from today's events
        for(let i=1;i<(24*60);i++){
            curProd[i] += curProd[i-1];
        }
        //Draw productivity line
        for(let i=0;i<(24*60);i++){
            const curProdPercent = curProd[i]*200
            const newLineDiv = lineDiv.cloneNode(true);
            newLineDiv.style.top = 100 + (200 - curProdPercent)+ "px";
            //newLineDiv.style.top = (326 - curProdPercent) + "px";
            newLineDiv.style.left = (i*100/(24*60)) + "%";
            productivityBar.appendChild(newLineDiv);
        }
      }

    // **************************************************************************
    // ****************************** App Initialization Completion ******************************
    // **************************************************************************
    // This contains all the methods.
    app.methods = {
        get_events: app.get_events,
        edit_event: app.edit_event,
        delete_event: app.delete_event,
        set_completed_setting: app.set_completed_setting,
        set_completed: app.set_completed,
        drawCalendar: app.drawCalendar,
        drawProductivityBar: app.drawProductivityBar,
        calcProductivity: app.calcProductivity,
        get_minutes_completed: app.get_minutes_completed,
        draw_cal_prod: app.draw_cal_prod,

    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        app.get_events();
        app.calcProductivity();

    };
    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
