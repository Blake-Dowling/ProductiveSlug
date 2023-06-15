"""
This file defines the database models
"""

import datetime
from datetime import timedelta

import random
from py4web.utils.populate import FIRST_NAMES, LAST_NAMES, IUP
from .common import db, Field, auth
from pydal.validators import *




def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None

def get_username():
    return auth.current_user.get('username') if auth.current_user else None

def get_time():
    return datetime.datetime.utcnow()


### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later


db.define_table(
        'event',
    Field('user_email'),
    Field('title'),
    Field('due_time'),
    Field('description'),
    Field('completion_time'),
    Field('start', 'datetime'),
    Field('end', 'datetime'),
    
)

db.commit()


    
# Comment out this line if you are not interested. 
def add_users_for_testing(num_events):
   # Test user names begin with "_".
   # Counts how many users we need to add.

   db(db.event).delete()

   for k in range( num_events):
       first_name = random.choice(FIRST_NAMES)
       if random.randint(0,10) > 2:
           user_email = "%s%.2i" % (first_name.lower(), k) + "@ucsc.edu"
       else:
           user_email = get_user_email()
       

       # Adds some content for each user.
       start_time = datetime.datetime.utcnow() - timedelta(hours=7)
       end_time = datetime.datetime.utcnow() - timedelta(hours=7)
       completion_t = datetime.datetime.utcnow() - timedelta(hours=7)
       
       for n in range(3):
           start_time += datetime.timedelta(minutes=random.uniform(-5000,  5000))
           end_time = start_time + datetime.timedelta(minutes=random.uniform(0,  240))
           end_of_day = start_time.replace(hour=23, minute=59, second=59)
           if end_of_day < end_time:
                end_time = end_of_day
           completion_t = start_time + datetime.timedelta(minutes=random.uniform(0,  240))
           if random.randint(0,1) == 0:
               completion_t = None
           m = dict(
               user_email=user_email,
               #user_email=get_user_email(),
               title = " ".join(random.choices(list(IUP.keys()), k=5)),
               completion_time = completion_t,
               start = start_time,
               end = end_time,
               due_time = end_time,
               description=" ".join(random.choices(list(IUP.keys()), k=20))
           )
           newID = db.event.insert(**m)
           #db(db.event.id == newID).update(id=newID)     
   db.commit()