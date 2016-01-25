import regex_core from 'bsrs-ember/utilities/array/regex-core';

var get_value = function(object, property) {
    return object.get(property) ? object.get(property).toString().toLowerCase() : null;
};

var array_func = function(object, property, regex) {
    let result;
    const prop = property.match(/^[^\[]+/);
    object.get(prop[0]).forEach((model, index) => {
        let value = get_value(model, this);
        let legit = regex.test(value);
        result = index > 0 ? result || legit : legit;
    });
    return result;
};

var func = function(object, property, regex) {
    return regex.test(get_value(object, property));
};

var regex_property = function(object, property, regex) {
    return regex_core(object, property, array_func, func, regex);
};

export default regex_property;
