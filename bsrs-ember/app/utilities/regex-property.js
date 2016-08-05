import regex_core from 'bsrs-ember/utilities/array/regex-core';

var get_value = function(object, property) {
    return object.get(property) ? object.get(property).toString().toLowerCase() : null;
};

/* @method array_func
* - actual search function that takes the search input and tests it against the model fields value
* @return result - boolean
*/
var array_func = function(object, property, regex) {
    let result;
    // convert to a new RegExp ('abc'.match(/^[^\[]+/) == ['abc'])
    const prop = property.match(/.*/);
    // forEach b/c might have multiple (categories)
    object.get(prop[0]).forEach((model, index) => {
        // get_value closure function and then
        let value = get_value(model, this);
        // returns true or false
        let legit = regex.test(value);
        result = index > 0 ? result || legit : legit;
    });
    return result;
};

var func = function(object, property, regex) {
    return regex.test(get_value(object, property));
};

/* @method regex_property
* - takes a hydrated object (ie server response) and a field and regex tests it
* @param {obj} object
* @param {string} property
* @return {bool} for filter function
*/
var regex_property = function(object, property, regex) {
    // model object, column field
    return regex_core(object, property, array_func, func, regex);
};

export default regex_property;
