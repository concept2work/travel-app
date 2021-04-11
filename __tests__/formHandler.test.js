import { getDaysUntilTrip } from '../src/client/js/formHandler';
// postUserSelection

// const axios = require('axios');
const moment = require('moment');

moment().format();

// jest.mock('axios');

// https://stackoverflow.com/questions/36069731/how-to-unit-test-api-calls-with-mocked-fetch-in-react-native-with-jest
// global.fetch = jest.fn(() => Promise.resolve());

// it('returns the title of the first album', async () => {
//   const response = {
//     city: 'Chicago',
//     latitude: '41.85003',
//     longitude: '-87.65005',
//     countryName: 'United States',
//     date: '2021-04-08',
//     daysUntilTrip: 0,
//     forecastDays: {
//       0: {
//         date: '2021-04-09',
//         avg_temp: 13.4,
//         temp_min: 10.2,
//         temp_max: 18.1,
//         pop: 40,
//         uv: 4.18045,
//         code: 803,
//         icon: 'c03d',
//         description: 'Broken clouds',
//       },
//       1: {
//         date: '2021-04-10',
//         avg_temp: 9,
//         temp_min: 3.2,
//         temp_max: 12.6,
//         pop: 100,
//         uv: 2.85386,
//         code: 502,
//         icon: 'r03d',
//         description: 'Heavy rain',
//       },
//       2: {
//         date: '2021-04-11',
//         avg_temp: 9,
//         temp_min: 8.4,
//         temp_max: 9.7,
//         pop: 90,
//         uv: 2.38402,
//         code: 500,
//         icon: 'r01d',
//         description: 'Light rain',
//       },
//       3: {
//         date: '2021-04-12',
//         avg_temp: 12.3,
//         temp_min: 8.2,
//         temp_max: 17.4,
//         pop: 20,
//         uv: 7.22465,
//         code: 802,
//         icon: 'c02d',
//         description: 'Scattered clouds',
//       },
//       4: {
//         date: '2021-04-13',
//         avg_temp: 8,
//         temp_min: 2.6,
//         temp_max: 10,
//         pop: 0,
//         uv: 2.40368,
//         code: 803,
//         icon: 'c03d',
//         description: 'Broken clouds',
//       },
//       5: {
//         date: '2021-04-14',
//         avg_temp: 7.8,
//         temp_min: 2.9,
//         temp_max: 11.1,
//         pop: 50,
//         uv: 2.60035,
//         code: 804,
//         icon: 'c04d',
//         description: 'Overcast clouds',
//       },
//       6: {
//         date: '2021-04-15',
//         avg_temp: 9.2,
//         temp_min: 3.2,
//         temp_max: 12.9,
//         pop: 20,
//         uv: 3.90167,
//         code: 803,
//         icon: 'c03d',
//         description: 'Broken clouds',
//       },
//       7: {
//         date: '2021-04-16',
//         avg_temp: 11.2,
//         temp_min: 3.7,
//         temp_max: 16.1,
//         pop: 0,
//         uv: 2.46002,
//         code: 803,
//         icon: 'c03d',
//         description: 'Broken clouds',
//       },
//       8: {
//         date: '2021-04-17',
//         avg_temp: 8.9,
//         temp_min: 7.6,
//         temp_max: 11.3,
//         pop: 65,
//         uv: 2.47402,
//         code: 804,
//         icon: 'c04d',
//         description: 'Overcast clouds',
//       },
//       9: {
//         date: '2021-04-18',
//         avg_temp: 9.7,
//         temp_min: 0.8,
//         temp_max: 15,
//         pop: 0,
//         uv: 5.86848,
//         code: 802,
//         icon: 'c02d',
//         description: 'Scattered clouds',
//       },
//       10: {
//         date: '2021-04-19',
//         avg_temp: 13.6,
//         temp_min: 10.7,
//         temp_max: 16.6,
//         pop: 0,
//         uv: 7.99021,
//         code: 803,
//         icon: 'c03d',
//         description: 'Broken clouds',
//       },
//       11: {
//         date: '2021-04-20',
//         avg_temp: 6.8,
//         temp_min: -0.3,
//         temp_max: 9.9,
//         pop: 85,
//         uv: 2.54457,
//         code: 500,
//         icon: 'r01d',
//         description: 'Light rain',
//       },
//       12: {
//         date: '2021-04-21',
//         avg_temp: 7.6,
//         temp_min: 2.5,
//         temp_max: 9.2,
//         pop: 0,
//         uv: 5.41732,
//         code: 804,
//         icon: 'c04d',
//         description: 'Overcast clouds',
//       },
//       13: {
//         date: '2021-04-22',
//         avg_temp: 9.7,
//         temp_min: 3.7,
//         temp_max: 12.6,
//         pop: 0,
//         uv: 8.06381,
//         code: 803,
//         icon: 'c03d',
//         description: 'Broken clouds',
//       },
//       14: {
//         date: '2021-04-23',
//         avg_temp: 11.3,
//         temp_min: 3.4,
//         temp_max: 15.9,
//         pop: 0,
//         uv: 8.35044,
//         code: 800,
//         icon: 'c01d',
//         description: 'Clear Sky',
//       },
//       15: {
//         date: '2021-04-24',
//         avg_temp: 14.5,
//         temp_min: 10.4,
//         temp_max: 17.4,
//         pop: 0,
//         uv: 8.12152,
//         code: 801,
//         icon: 'c02d',
//         description: 'Few clouds',
//       },
//     },
//     abstract: "Chicago ( (), locally also ), officially the City of Chicago, is the most populous city in the U.S. state of Illinois, and the third-most-populous city in the United States. With an estimated population of 2,693,976 in 2019, it is also the most populous city in the Midwestern United States. Chicago is the county seat of Cook County, the second-most-populous county in the US, with a small portion of the northwest side of the city extending into DuPage County near O'Hare Airport. Chicago is the principal city of the Chicago metropolitan area, often referred to as Chicagoland. At nearly 10 million people, the metropolitan area is the third most populous in the United States. Located on the shores of freshwater Lake Michigan, Chicago was incorporated as a city in 1837 near a portage between the Great Lakes and the Mississippi River watershed and grew rapidly in the mid-19th century. After the Great Chicago Fire of 1871, which destroyed several square miles and left more than 100,000 homeless, the city made a concerted effort to rebuild. The construction boom accelerated population growth throughout the following decades, and by 1900, less than 30 years after the great fire, Chicago was the fifth-largest city in the world. Chicago made noted contributions to urban planning and zoning standards, including new construction styles (including the Chicago School of architecture), the development of the City Beautiful Movement, and the steel-framed skyscraper. Chicago is an international hub for finance, culture, commerce, industry, education, technology, telecommunications, and transportation. It is the site of the creation of the first standardized futures contracts, issued by the Chicago Board of Trade, which today is part of the largest and most diverse derivatives market in the world, generating 20% of all volume in commodities and financial futures alone. Depending on the particular year, the city's O'Hare International Airport is routinely ranked as the world's fifth or sixth busiest airport according to tracked data by the Airports Council International. The region also has the largest number of federal highways and is the nation's railroad hub. Chicago was listed as an alpha global city by the Globalization and World Cities Research Network, and it ranked seventh in the entire world in the 2017 Global Cities Index. The Chicago area has one of the highest gross domestic products (GDP) in the world, generating $689 billion in 2018. In addition, the city has one of the world's most diversified and balanced economies, with no single industry employing more than 14% of the workforce. Chicago is home to several Fortune 500 companies, including Allstate, Boeing, Caterpillar, Exelon, Kraft Heinz, McDonald's, Mondelez International, Sears, United Airlines Holdings, US Foods, and Walgreens. Chicago's 58 million domestic and international visitors in 2018 made it the second most visited city in the nation, as compared with New York City's 65 million visitors in 2018. The city was ranked first in the 2018 Time Out City Life Index, a global quality of life survey of 15,000 people in 32 cities. Landmarks in the city include Millennium Park, Navy Pier, the Magnificent Mile, the Art Institute of Chicago, Museum Campus, the Willis (Sears) Tower, Grant Park, the Museum of Science and Industry, and Lincoln Park Zoo. Chicago's culture includes the visual arts, literature, film, theatre, comedy (especially improvisational comedy), food, and music, particularly jazz, blues, soul, hip-hop, gospel, and electronic dance music including house music. Of the area's many colleges and universities, the University of Chicago, Northwestern University, and the University of Illinois at Chicago are classified as \"highest research\" doctoral universities. Chicago has professional sports teams in each of the major professional leagues, including two Major League Baseball teams.",
//     abstractParsed: [
//       {
//         text: 'Chicago ( (), locally also ), officially the City of Chicago, is the most populous city in the U.S. state of Illinois, and the third-most-populous city in the United States.',
//       },
//       {
//         text: 'With an estimated population of 2,693,976 in 2019, it is also the most populous city in the Midwestern United States.',
//       },
//       {
//         text: "Chicago is the county seat of Cook County, the second-most-populous county in the US, with a small portion of the northwest side of the city extending into DuPage County near O'Hare Airport.",
//       },
//       {
//         text: 'Chicago is the principal city of the Chicago metropolitan area, often referred to as Chicagoland.',
//       },
//       {
//         text: 'At nearly 10 million people, the metropolitan area is the third most populous in the United States.',
//       },
//       {
//         text: 'Located on the shores of freshwater Lake Michigan, Chicago was incorporated as a city in 1837 near a portage between the Great Lakes and the Mississippi River watershed and grew rapidly in the mid-19th century.',
//       },
//       {
//         text: 'After the Great Chicago Fire of 1871, which destroyed several square miles and left more than 100,000 homeless, the city made a concerted effort to rebuild.',
//       },
//       {
//         text: 'The construction boom accelerated population growth throughout the following decades, and by 1900, less than 30 years after the great fire, Chicago was the fifth-largest city in the world.',
//       },
//       {
//         text: 'Chicago made noted contributions to urban planning and zoning standards, including new construction styles (including the Chicago School of architecture), the development of the City Beautiful Movement, and the steel-framed skyscraper.',
//       },
//       {
//         text: 'Chicago is an international hub for finance, culture, commerce, industry, education, technology, telecommunications, and transportation.',
//       },
//       {
//         text: 'It is the site of the creation of the first standardized futures contracts, issued by the Chicago Board of Trade, which today is part of the largest and most diverse derivatives market in the world, generating 20% of all volume in commodities and financial futures alone.',
//       },
//       {
//         text: "Depending on the particular year, the city's O'Hare International Airport is routinely ranked as the world's fifth or sixth busiest airport according to tracked data by the Airports Council International.",
//       },
//       {
//         text: "The region also has the largest number of federal highways and is the nation's railroad hub.",
//       },
//       {
//         text: 'Chicago was listed as an alpha global city by the Globalization and World Cities Research Network, and it ranked seventh in the entire world in the 2017 Global Cities Index.',
//       },
//       {
//         text: 'The Chicago area has one of the highest gross domestic products (GDP) in the world, generating $689 billion in 2018.',
//       },
//       {
//         text: "In addition, the city has one of the world's most diversified and balanced economies, with no single industry employing more than 14% of the workforce.",
//       },
//       {
//         text: "Chicago is home to several Fortune 500 companies, including Allstate, Boeing, Caterpillar, Exelon, Kraft Heinz, McDonald's, Mondelez International, Sears, United Airlines Holdings, US Foods, and Walgreens.",
//       },
//       {
//         text: "Chicago's 58 million domestic and international visitors in 2018 made it the second most visited city in the nation, as compared with New York City's 65 million visitors in 2018.",
//       },
//       {
//         text: 'The city was ranked first in the 2018 Time Out City Life Index, a global quality of life survey of 15,000 people in 32 cities.',
//       },
//       {
//         text: 'Landmarks in the city include Millennium Park, Navy Pier, the Magnificent Mile, the Art Institute of Chicago, Museum Campus, the Willis (Sears) Tower, Grant Park, the Museum of Science and Industry, and Lincoln Park Zoo.',
//       },
//       {
//         text: "Chicago's culture includes the visual arts, literature, film, theatre, comedy (especially improvisational comedy), food, and music, particularly jazz, blues, soul, hip-hop, gospel, and electronic dance music including house music.",
//       },
//       {
//         text: "Of the area's many colleges and universities, the University of Chicago, Northwestern University, and the University of Illinois at Chicago are classified as \"highest research\" doctoral universities.",
//       },
//       {
//         text: 'Chicago has professional sports teams in each of the major professional leagues, including two Major League Baseball teams.',
//       },
//     ],
//     comment: "Chicago ( (), locally also ), officially the City of Chicago, is the most populous city in the U.S. state of Illinois, and the third-most-populous city in the United States. With an estimated population of 2,693,976 in 2019, it is also the most populous city in the Midwestern United States. Chicago is the county seat of Cook County, the second-most-populous county in the US, with a small portion of the northwest side of the city extending into DuPage County near O'Hare Airport. Chicago is the principal city of the Chicago metropolitan area, often referred to as Chicagoland. At nearly 10 million people, the metropolitan area is the third most populous in the United States.",
//     area: '6.066e+08',
//     population: '2695598',
//     imageId: 943398,
//     largeImageURL: 'https://pixabay.com/get/gd19256daf70813723908f9f33f7634cde954c19840d3672989b0d627de68fad71f90b10c7125efe441921e5459fd0258_1280.jpg',
//   };
//   axios.get.mockResolvedValue(response);

//   const serverResponse = await postUserSelection({
//     city: 'Chicago', countryCode: 'US', date: 'Fri Apr 09 2021', daysUntilTrip: 0,
//   });

//   console.log(`serverResponse ${serverResponse}`);

//   expect(serverResponse).toEqual(response);
// });
// // https://stackoverflow.com/questions/563406/add-days-to-javascript-date
// // eslint-disable-next-line no-extend-native
// Date.prototype.addDays = function (days) {
//   const date = new Date(this.valueOf());
//   date.setDate(date.getDate() + days);
//   return date;
// };

describe('Testing the response functionality for the calculation of days.', () => {
//   test(`Testing a date that is five days in the future.
//   Since the travel day is counted as one day, four days are added.`, () => {
//     const today = new Date();
//     const inFiveDays = today.addDays(5);
//     console.log(inFiveDays);
//     expect(getDaysUntilTrip(inFiveDays)).toBe(5);
//   });
  const inFiveDays = moment().add(5, 'days');
  test('Testing a date that is five days in the future.', () => {
    expect(getDaysUntilTrip(inFiveDays)).toBe(5);
  });
});
