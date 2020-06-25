# Debate_backend

Backend for debate app to be run with Debate_frontend

This is the backend for a discussion platform to be used with Debate_frontend.

The repo currently includes the files for user registration, account activation with sendgrid api. Password reset and forgot password functionalty.

The project will be a platform for opinionated discussions with arguments and counter arguments. Users will recieve points (carma in reddit) through friction points.

Technology stack includes React, redux for state management, express for the rest API and a mongoDB database.

React is only functional components using hooks for component initialisation.

In order to run app

1. clone frontend repo at: https://github.com/FrancoisvanRensburg/Debate_frontend
2. Create environment variables for
   2.1. DATABASE connection with local mongo or mongodb atlas uri
   2.2. JWT secret tokens (secret, account activation, reset password, email from, email to for sendgrid)
   2.3. Environment as development
3. Register account with sendgrid and follow instruction on sendgrid to integrate API for node platform
4. run app.js with npm start
