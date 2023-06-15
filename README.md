# ProductiveSlug

# How to Use:

Click 'New Test' in order to load test events.

Click on different elements in order to adjust filters and data.

# Features:

## Productivity Bar

This app allows the user to visualize the productivity of a themselves, their team, and other users. A menu of buttons allows the user to select the desired filter settings.

The productivity bar allows users to inspect the filtered group of events as time blocks. A calculation of the events' productivity is displayed above the bar, and a line represents the cumulative productivity.

Events are color-coded, with red indicating overdue, blue indicating uncompleted, and green indicated completed.

Clicking on a productivity bar event will filter all events for the applicable user. Clicking again on the bar will return to displaying all events for the day.

## Task List

The filtered events are also displayed on the left task list, sorted in asscending order by due date. Task lists containing multiple dates are categorized accordingly.

The card for each task contains clickable elements, allowing editing, deleting, completion, and filter changes. Clicking a date category allows tasks to be filtered by both user and date.

A task's due date is labelled as late, on time, or overdue according to the current time.

## Calendar

The calendar lists all events, color coded by their completion/overdue status. Events that are currently filtered are displayed in full opacity, while all others are transparent. The cumulative productivity for each day is displayed under the date heading, and updates according to the task filter selected.

Clicking on a date filters out all events on that date, and displays them on the productivity bar. Clicking on a single event will filter out that event.

## Event Creation / Editing

Events are added/edited using a py4web form, using the date time widget to allow easy selection. The edit form is initialized with the former event data.

## Misc

Clicking the 'New Test' button will reload new test tasks.

Productivity is defined as amount of time spent completing event over total time. 100% productivity would be 24 hours of continuous time spent on sequential tasks. Concurrent tasks may yield productivity greater than 100%.

# What I Learned / Obstacles:

I originally wanted to have multiple pages, but I decided that the app is more streamlined and functional if it’s all in one page, essentially. I achieved this by making the UI more compact, eliminating unnecessary information such as seconds.

Testing was very important for my ability to implement the app. I adapted the test data function previously used for our Meow assignment to instead insert data for events, enabling me to make sure that events were properly displayed in the productivity bar, event list, and calendar.

Working with date times as well as objects between python and javascript was a challenge, because the formats e.g. datetimes, quotations, and None/null had to be converted in addition to converting strings into other data types.

One of the things I struggled with the most was routing, because I didn’t actually understand the controllers and yatl URL decorator enough. Once I realized that the controller is activated when you redirect to the defined url and arguments, I was able to pass vue and js arguments into different pages. I had previously attemted to manipulate yatl href strings using jquery, but this was unsafe and time consuming.

The main obstacle I faced was learning to manually create features using javascript to manipulate the dom.
I initially found FullCalendar JS to be constrained, but I made use of the ability to define event handlers in order to interface it with the productivity meter and the task list. However, there were some features which disappointingly were not possible such as event time blocks and certain clicking and display alterations. However, this simply led me to learn to create my own seperate features, such as the productivity bar.

Additionally, integrating python, javascript, vue, yatl, and html involved really understanding how each language can communicate with the others. 


# Stretch Goals:

I really want to get more analytical with the productivity statistics, like tracking weekly, monthly, overall productivity for each user category. I also want to calculate each user’s contribution.

Zooming in on productivity bar, manipulating events.

Urgency, priority, and productivity weight of tasks,
custom task sorting.

Recurring events, recommended by Akila.
