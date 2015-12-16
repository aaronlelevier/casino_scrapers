import Ember from 'ember';
import regex_core from 'bsrs-ember/utilities/array/regex-core';

var array_func = function(object, property) {
    let result;
    const prop = property.match(/^[^\[]+/);
    const all = object.get(prop[0]) || [];
    all.forEach((model, index) => {
        const value = model.get(this) || '';
        result = index > 0 ? `${result} &#8226; ${value}` : value;
    });
    const legit = all.get('length') > 0 && result.replace(/&#8226;/g, '').trim().length > 0;
    return legit ? Ember.String.htmlSafe(result) : '';
};

var func = function(object, property) {
    return object.get(property) || '';
};

var GridColumnText = Ember.Helper.helper((params) => {
    const object = params[0];
    const property = params[1];
    return regex_core(object, property, array_func, func);
});

export default GridColumnText;
