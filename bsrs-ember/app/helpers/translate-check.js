import Ember from 'ember';

export function translateCheck(params/*, hash*/) {
    return Ember.$.inArray(params[0], params[1]) > -1 ? true : false;
}

export default Ember.Helper.helper(translateCheck);
