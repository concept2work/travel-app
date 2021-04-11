# Project: Project: Travel App for the Front End Web Developer Nanodegree Program

## Project goal
In this project, I developed a travel app that requests a travel location (city and country) as well as a travel date from a user. The app displays a weather forecast or historical weather data, an image of the city or country and a suitable information text. The information is generated by using external APIs.

## Development procedure
The project is based on [Express](https://expressjs.com/) to provide a server where data is stored and retrievable by the app. To accomplish this, GET and POST server routes were provided for communication purposes with the app. The server retrieves and processes data from four different APIs: [GeoNames](https://www.geonames.org/), [Weatherbit.io](https://www.weatherbit.io/), [DBpedia](https://www.dbpedia.org/) and [Pixabay](https://pixabay.com/).The retrieved information is served via specific routes. The app retrieves the information and updates the user interface with the received data from the Express server. Error handling is provided to give meaningful feedback in case something goes wrong. Furthermore [webpack](https://webpack.js.org/) is used to generate different bundles for production and development.

## Resources
- The app's layout is based on [Bootstrap](https://getbootstrap.com).
- The general JavaScript code structure is based on [Udacity's starter code](https://github.com/udacity/fend/tree/refresh-2019/projects/evaluate-news-nlp).
- For the weather forecast [Weather Icons](https://erikflowers.github.io/weather-icons/) by Erik Flowers are used.

## Installation
Prerequisite is the installation of *node.js*. To install node.js follow the instructions on the [node.js website](https://nodejs.org/) for your operating system.

Use *npm* to install the required packes for the project. All necessary packages will be installed:
````
npm install
````

### Get API keys
To get a working application it is necessary to obtain several free API keys. To do so, create an account for [GeoNames](http://www.geonames.org/export/web-services.html), [Pixabay](https://pixabay.com/api/docs/) and [Weatherbit.io](https://www.weatherbit.io/account/create).

### Include environment variables
The project uses a *.env* file to store necessary environment variables. This file is not provided via the project files so create it manually in the project root:
````
touch .env
````
Edit *.env* and enter the following lines:
````
GEONAMES_USER=<Your GeoNames user name>
WEATHERBIT_API_KEY=<Your Weatherbit.io API key>
PIXABAY_API_KEY=<Your Pixabay API key>
PORT_DEV_FRONTEND=8080
PORT_DEV_BACKEND=8081
PORT_PROD=5000
````
In development mode `PORT_DEV_BACKEND` specifies the server's port, while `PORT_DEV_FRONTEND` specifies a different port for the app's frontend since [DevServer](https://webpack.js.org/configuration/dev-server/) with [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) is used and therefore client and server must have different addresses. `PORT_PROD` specifies the production mode port. It is possible to change these values.

### Production mode
In production mode it is only necessary to start via:
````
npm run prod
````
You can open the application on localhost with your specified `PORT_PROD`, e. g. [localhost:5000](http://localhost:5000).

### Development mode
It is necessary to start the express server for the backend and furthermore build the webpack bundle for the frontend. Use the following commands to do so:
````
npm run dev
````
In a second terminal window type:
````
npm run start
````
You can open the application on localhost with your specified `PORT_DEV_FRONTEND`, e. g. [localhost:8080](http://localhost:8080).