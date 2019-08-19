# INTERActor

Deliverable D4.3.2

## Deployment
The application is a Node.js based client server application. There are, included in the distribution files to deploy via Docker.

Dockerfile

docker-compose.yml

Use

> docker-compose build 

to build a version of the application

> docker-compose up 

will run a localhost version of the application

## Application Architecture
There are three main components to the INTERActor architecture

1. Node.JS - Server application where all the application / business logic resides
2. MongoDB - Basic Mongo DB instance used to store the data for the application
3. HTML Front end - migrating over to using the ReactJS framework, served from the Node.JS application layer


Notes:

    "build": "browserify -t [ babelify ] main.js -o ./public/bundle.js"



