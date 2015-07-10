var STATES = [
  {"id": 1,"name":"Alabama","abbr":"AL"},
  {"id": 2,"name":"Alaska","abbr":"AK"},
  {"id": 3,"name":"Arizona","abbr":"AZ"},
  {"id": 4,"name":"Arkansas","abbr":"AR"},
  {"id": 5,"name":"California","abbr":"CA"},
  {"id": 6,"name":"Colorado","abbr":"CO"},
  {"id": 7,"name":"Connecticut","abbr":"CT"},
  {"id": 8,"name":"Delaware","abbr":"DE"},
  {"id": 9,"name":"District of Columbia","abbr":"DC"},
  {"id": 10,"name":"Florida","abbr":"FL"},
  {"id": 11,"name":"Georgia","abbr":"GA"},
  {"id": 12,"name":"Hawaii","abbr":"HI"},
  {"id": 13,"name":"Idaho","abbr":"ID"},
  {"id": 14,"name":"Illinois","abbr":"IL"},
  {"id": 15,"name":"Indiana","abbr":"IN"},
  {"id": 16,"name":"Iowa","abbr":"IA"},
  {"id": 17,"name":"Kansa","abbr":"KS"},
  {"id": 18,"name":"Kentucky","abbr":"KY"},
  {"id": 19,"name":"Lousiana","abbr":"LA"},
  {"id": 20,"name":"Maine","abbr":"ME"},
  {"id": 21,"name":"Maryland","abbr":"MD"},
  {"id": 22,"name":"Massachusetts","abbr":"MA"},
  {"id": 23,"name":"Michigan","abbr":"MI"},
  {"id": 24,"name":"Minnesota","abbr":"MN"},
  {"id": 25,"name":"Mississippi","abbr":"MS"},
  {"id": 26,"name":"Missouri","abbr":"MO"},
  {"id": 27,"name":"Montana","abbr":"MT"},
  {"id": 28,"name":"Nebraska","abbr":"NE"},
  {"id": 29,"name":"Nevada","abbr":"NV"},
  {"id": 30,"name":"New Hampshire","abbr":"NH"},
  {"id": 31,"name":"New Jersey","abbr":"NJ"},
  {"id": 32,"name":"New Mexico","abbr":"NM"},
  {"id": 33,"name":"New York","abbr":"NY"},
  {"id": 34,"name":"North Carolina","abbr":"NC"},
  {"id": 35,"name":"North Dakota","abbr":"ND"},
  {"id": 36,"name":"Ohio","abbr":"OH"},
  {"id": 37,"name":"Oklahoma","abbr":"OK"},
  {"id": 38,"name":"Oregon","abbr":"OR"},
  {"id": 39,"name":"Pennsylvania","abbr":"PA"},
  {"id": 40,"name":"Rhode Island","abbr":"RI"},
  {"id": 41,"name":"South Carolina","abbr":"SC"},
  {"id": 42,"name":"South Dakota","abbr":"SD"},
  {"id": 43,"name":"Tennessee","abbr":"TN"},
  {"id": 44,"name":"Texas","abbr":"TX"},
  {"id": 45,"name":"Utah","abbr":"UT"},
  {"id": 46,"name":"Vermont","abbr":"VT"},
  {"id": 47,"name":"Virginia","abbr":"VA"},
  {"id": 48,"name":"Washington","abbr":"WA"},
  {"id": 49,"name":"West Virginia","abbr":"WV"},
  {"id": 50,"name":"Wisconsin","abbr":"WI"},
  {"id": 51,"name":"Wyoming","abbr":"WY"}
]

if (typeof window === 'undefined') {
    module.exports = STATES;
} else {
    define('bsrs-ember/vendor/state_fixtures', ['exports'], function (exports) {
        'use strict';
        return STATES;
    });
}
