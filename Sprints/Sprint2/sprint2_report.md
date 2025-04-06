# Sprint 2 Report
Video Link: 

## What's New (User Facing)
* Frontend setup
* Navbar
* logging in and signing up functionality
* Equipment page, booking functionality, admin approval, and profile options
  
## Work Summary (Developer Facing)
Our team focused on the frontend as well as some of the core features for the Lab Booking System. Users are able to sign up and log in. We have an Equipment page that pulls data from the PostgreSQL database and populates a table that is clear for a user. The user is now able to book reservations on the equipment and from the admin view, adm;ins can make a decision on them. Finally, we have a profile page that shows when the account was created. 

## Unfinished Work
Testing of UI/UX. For every feature we added, we need to make sure there are no bugs or anomalies. We are unable to get updates or responses from the team member assigned to this issue. As of 04/06/25, there is no progress for this issue.

## Completed Issues/User Stories
Below are the issues completed during this sprint:

Christian Manangan
https://github.com/killacoug9/CPTS-451-Group-Project/issues/12
Story Points: 3
https://github.com/killacoug9/CPTS-451-Group-Project/issues/13
Story Points: 3
https://github.com/killacoug9/CPTS-451-Group-Project/issues/15
Story Points: 3
https://github.com/killacoug9/CPTS-451-Group-Project/issues/16
Story Points: 4

Kyle Hawkins
https://github.com/killacoug9/CPTS-451-Group-Project/issues/15
Story Points: 3
https://github.com/killacoug9/CPTS-451-Group-Project/issues/16
Story Points: 4
https://github.com/killacoug9/CPTS-451-Group-Project/issues/21
Story Points: 3
https://github.com/killacoug9/CPTS-451-Group-Project/issues/22
Story Points: 4
https://github.com/killacoug9/CPTS-451-Group-Project/issues/23
Story Points: 5
https://github.com/killacoug9/CPTS-451-Group-Project/issues/24
Story Points: 4

Ethan Frazier
https://github.com/killacoug9/CPTS-451-Group-Project/issues/17
Story Points: 2
  
## Incomplete Issues/User Stories
Here are links to issues we worked on but did not complete in this sprint:

https://github.com/killacoug9/CPTS-451-Group-Project/issues/17

No response or updates from team member assigned to this issue.
  
## Code Files for Review
Please review the following code files, which were actively developed during this
sprint, for quality:
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/public/index.html
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/App.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/App.js
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/index.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/index.js
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/Home.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/app/__init__.py
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/Home.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/app/auth.py
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/app/models.py
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/app/routes.py
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/ProtectedRoute.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/auth/Auth.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/auth/AuthContext.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/auth/Login.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/auth/Register.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/auth/UserProfile.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/auth/UserProfile.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/AdminReservations.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/AdminReservations.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/BookingModal.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/BookingModal.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/EquipmentList.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/EquipmentList.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/Navigation.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/Navigation.jsx
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/Reservations.css
* https://github.com/killacoug9/CPTS-451-Group-Project/blob/main/LabBookingSystem/frontend/src/views/Reservations.jsx
  
## Retrospective Summary
Here's what went well:
* Flushed front end and backend is connected
* worked on lots of extra features such as admin approval, profile options, and more that were for sprint3 initially
  
Here's what we'd like to improve:
* Better and early communication to ensure every team member contributes
* Encourage team members to push through and ask for help
  
Here are changes we plan to implement in the next sprint:
* Notification system (approved/denied)
* Allow users to cancel/modify reservations
* Final testing
