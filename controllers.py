"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import datetime
import random
import time
from time import sleep

from py4web import action, request, abort, redirect, URL, Field
from py4web.utils.form import Form, FormStyleBulma, DateTimeWidget, CheckboxWidget
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_username
from .models import add_users_for_testing
import uuid
from datetime import datetime
from datetime import timedelta
from .models import get_user_email
import re


url_signer = URLSigner(session)

############################## New Test ##############################
@action('new_test')
@action.uses(db, auth.user, url_signer)
def new_test():
    add_users_for_testing(50)
    redirect(URL('index'))

############################## Index ##############################
@action('index')
@action.uses('index.html', db, auth.user, url_signer)
def index():
    return dict(
        calendar_url = URL('calendar', signer=url_signer), #
        new_test_url = URL('new_test', signer=url_signer),
        add_event_url=URL('add_event', signer=url_signer),
        edit_event_url=URL('edit_event', signer=url_signer),
        delete_event_url=URL('delete_event', signer=url_signer),
        get_events_url = URL('get_events', signer=url_signer), #for index.js to request user db
        get_all_events_url = URL('get_all_events', signer=url_signer), #for index.js to request user db
        set_completed_setting_url = URL('set_completed_setting', signer=url_signer), #for index.js to request user db
        set_completed_url = URL('set_completed', signer=url_signer), #for index.js to request user db
        get_minutes_url = URL('get_minutes', signer=url_signer), #for index.js to request user db
        #current_user = auth.get_user(), #Signed-in user
        current_user = get_user_email(), #Signed-in user
        calendar_events = db((db.event.user_email == get_user_email())).select(db.event.id, db.event.title, db.event.start, db.event.end).as_list(),
        url_signer=url_signer,
    )

############################## Calendar ##############################
@action('calendar')
@action.uses('calendar.html', db, auth.user, url_signer)
def calendar():
    event_query = db(db.event).select(db.event.id, db.event.title, db.event.start, db.event.end, limitby=(0,50)).as_list()
    #event_query = db(db.event.user_email == get_user_email()).select(db.event.id, db.event.title, db.event.start, db.event.end).as_list()
    return dict(
        edit_event_url=URL('edit_event', signer=url_signer),
        url_signer=url_signer,
        calendarEvents = event_query,
    )

############################## Add Event ##############################
#url_signer.verify()
@action('add_event', method=["GET", "POST"])
@action.uses('add_event.html', db, session, auth.user)
def add():
    FormStyleBulma.widgets['Start']=DateTimeWidget() #Set 'Start' field's style to DateTimeWidget
    FormStyleBulma.widgets['End']=DateTimeWidget() #Set 'End' field's style to DateTimeWidget
    FormStyleBulma.widgets['Due']=DateTimeWidget() #Set 'End' field's style to DateTimeWidget
    form = Form([Field('Event_Title'), 
                 Field('Start', default=datetime.now()), 
                 Field('End', default=datetime.now()  + timedelta(hours=1)) , 
                 Field('Due', default=datetime.now()  + timedelta(hours=1)), 
                 Field('Description')], 
                 csrf_session=session, formstyle=FormStyleBulma) #Passes Form
    #instance, using event database defined in models to add 'add_event.html'
    if form.accepted:
        converted_start = datetime.strptime(form.vars['Start'], '%Y-%m-%dT%H:%M')
        converted_end = datetime.strptime(form.vars['End'], '%Y-%m-%dT%H:%M')
        ins = db.event.insert(user_email = get_user_email(),
                        title = form.vars['Event_Title'],
                        start = converted_start,
                        end = converted_end,
                        due_time = form.vars['Due'],
                        description = form.vars['Description'])
        redirect(URL('index'))
    return dict(form=form, url_signer=url_signer)

############################## Edit Event ##############################

@action('edit_event/<event_id>', method=["GET", "POST"])
@action.uses('edit_event.html', db, session, auth.user)
def edit(event_id=None):
    #event_id = request.params.get('event_id') #Get user_id from index.js's axios request
    #event_id=1
    print("-----------------",event_id)
    prev_event = db.event[event_id] #event to be edited

    if prev_event is None: #no event with event_id found
        redirect(URL('index')) #redirect to home
    FormStyleBulma.widgets['Start']=DateTimeWidget() #Set 'Start' field's style to DateTimeWidget
    FormStyleBulma.widgets['End']=DateTimeWidget() #Set 'End' field's style to DateTimeWidget
    FormStyleBulma.widgets['Due']=DateTimeWidget() #Set 'Due' field's style to DateTimeWidget
    FormStyleBulma.widgets['Completion']=DateTimeWidget() #Set 'Due' field's style to DateTimeWidget

    form = Form([Field('Event_Title', default=prev_event.title), 
                 Field('Start', default=prev_event.start), 
                 Field('End', default=prev_event.end), 
                 Field('Due', default=prev_event.due_time),
                 Field('Completion', default=prev_event.completion_time),
                 Field('Description', default=prev_event.description),], 
                 csrf_session=session, formstyle=FormStyleBulma) #Passes Form
    #instance, using event database defined in models to add 'add_event.html'
    if form.accepted: #If form indicates desired edit has occurred, redirect to home
        converted_start = datetime.strptime(form.vars['Start'], '%Y-%m-%dT%H:%M')
        converted_end = datetime.strptime(form.vars['End'], '%Y-%m-%dT%H:%M')
        prev_event.update_record(user_email = get_user_email(),
                        title = form.vars['Event_Title'],
                        start = converted_start,
                        end = converted_end,
                        due_time = form.vars['Due'],
                        completion_time = form.vars['Completion'],
                        description = form.vars['Description'],
                          )
        redirect(URL('index'))
    return dict(form=form, event_id=event_id,url_signer=url_signer) #pass edit form to edit.html
############################## Delete Event ##############################
#url_signer.verify(),
@action('delete_event', method=["GET", "POST"])
@action.uses( db, session, auth.user)
def delete():
    event_id = request.params.get('event_id') #Get user_id from index.js's axios request
    db(db.event.id == event_id).delete()
    return "ok"

############################## Get All Events ##############################
@action('get_all_events', method="GET")
@action.uses(db, auth.user)
def get_all_events():
    NUM_EVENTS = 1000
    rows_query=[] #initialize event query list
    ############################## All Events ##############################
    all_events = db(db.event).select(orderby=db.event.end, limitby=(0,NUM_EVENTS))
    for event in all_events: 
        rows_query.append(event) #
    ############################## Return Event Object List ##############################
    rows_object = [] #Stores event objects - gets passed back to js get_events function
    for row in rows_query: #For each original event
        rows_object.append({"id": row.id, "user_email": row.user_email, "title": row.title,"start": row.start, "end": row.end, "due_time": row.due_time, "description": row.description, "completion_time": row.completion_time})
    return dict(results=rows_object) #Pass matched events back to js search function


############################## Get Events ##############################
@action('get_events', method="GET")
@action.uses(db, auth.user)
def get_events():
    NUM_EVENTS = 1000
    setting = request.params.get('setting') #Get user_id from index.js's axios request
    date = request.params.get('date') #Get user_id from index.js's axios request
    date = datetime.strptime(date, '%m/%d/%Y').date()
    rows_query=[] #initialize event query list
    ############################## Single Date ##############################
    dateRegex = re.compile("....-..-..") #Expected datestring regex
    if dateRegex.match(setting): #date passed
        setting = datetime.strptime(setting, '%Y-%m-%d').date()
        #Get all completed events on specified start date
        all_events = db(db.event).select()
        rows_query = []
        #Completed events for specified user
        for event in all_events:
            if event['start'].date() == setting:
                rows_query.append(event)
    ############################## Single Event ##############################
    elif setting.isnumeric(): #event id passed
        all_events = db(db.event.id == int(setting)).select(orderby=db.event.end, limitby=(0,NUM_EVENTS))
        for event in all_events: 
            rows_query.append(event) #
    ############################## Your Events ##############################
    elif setting == "your_events":
        your_events = db(get_user_email() == db.event.user_email).select(orderby=db.event.end, limitby=(0,NUM_EVENTS))
        for event in your_events: 
            if event['start'].date() == date:
                rows_query.append(event) #
    ############################## Your Completed Events ##############################
    elif setting == "your_completed":
        your_events = db(get_user_email() == db.event.user_email).select(orderby=db.event.end, limitby=(0,NUM_EVENTS))
        for event in your_events: 
            if event['completion_time'] != None and event['start'].date() == date:
                rows_query.append(event) #

     ############################## Your Uncompleted Events ##############################
    elif setting == "your_uncompleted":
        your_events = db(get_user_email() == db.event.user_email).select(orderby=db.event.end, limitby=(0,NUM_EVENTS)) 
        for event in your_events: 
            if event['completion_time'] == None and event['start'].date() == date:
                rows_query.append(event) #

    ############################## All Events ##############################
    elif setting == "all_events":
        all_events = db(db.event).select(orderby=db.event.end, limitby=(0,NUM_EVENTS))
        for event in all_events: 
            if event['start'].date() == date:
                rows_query.append(event) #
    ############################## Uncompleted Events ##############################
    elif setting == "uncompleted":
        all_events = db(db.event.completion_time == None).select(orderby=db.event.end, limitby=(0,NUM_EVENTS)) 
        for event in all_events: 
            if event['start'].date() == date:
                rows_query.append(event) #
    ############################## Completed Events ##############################
    elif setting == "completed":
        all_events = db(db.event.completion_time != None).select(orderby=db.event.completion_time, limitby=(0,NUM_EVENTS)) #Original db table for events
        for event in all_events: 
            if event['start'].date() == date:
                rows_query.append(event) #
    ############################## Single User's Events ##############################
    elif setting: #user email passed
        all_events = db(db.event.user_email == setting).select(orderby=db.event.end, limitby=(0,NUM_EVENTS))
        for event in all_events:
            #if event['start'].date() == date: 
            rows_query.append(event) #
    ############################## Return Event Object List ##############################
    rows_object = [] #Stores event objects - gets passed back to js get_events function
    for row in rows_query: #For each original event
        rows_object.append({"id": row.id, "user_email": row.user_email, "title": row.title,"start": row.start, "end": row.end, "due_time": row.due_time, "description": row.description, "completion_time": row.completion_time})
    return dict(results=rows_object) #Pass matched events back to js search function


############################## Set Completed ##############################
@action('set_completed', method="POST")
@action.uses(db, auth.user)
def set_completed():
    event_id = request.json.get('event_id') #Get passed event ID
    db(db.event.id == event_id).update(completion_time= datetime.now()) #Update event table completion time
    #to current time
    return "ok"

############################## Get Completed Minutes ##############################
@action('get_minutes', method="GET")
@action.uses(db, auth.user)
def get_minutes():
    date = request.params.get('date') #Get user_id from index.js's axios request
    user = request.params.get('user') #Get user_id from index.js's axios request
    #Convert JS date into Py date
    date = date.split("T")
    if len(date):
        date = date[0]
    else:
        return dict(results="")
    
    date = datetime.strptime(date, '%Y-%m-%d').date()
    #Get all completed events on specified start date
    events = db(db.event).select().as_list()
    eventsOnDate = []
    #Completed events for specified user
    if user == "your_events" or user == "your_completed" or user == "your_uncompleted":
        for event in events:
            if event['start'].date() == date and event['completion_time'] and event['user_email'] == get_user_email():
                eventsOnDate.append(event)
    #Completed events for all users
    elif "@" in user:
        for event in events:
            if event['start'].date() == date and event['completion_time'] and event['user_email'] == user:
                eventsOnDate.append(event)
    else:
        for event in events:
            if event['start'].date() == date and event['completion_time']:
                eventsOnDate.append(event)
        #Completed events for specified user

    #Sum minutes of completed events
    completedMinutes = 0
    for event in eventsOnDate:
        endTime = event['end']
        startTime = event['start']
        completedMinutes += (endTime - startTime).total_seconds()
    completedMinutes = completedMinutes / 60
    return dict(results=completedMinutes) #Pass matched events back to js search function