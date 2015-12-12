import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';

export function gridData(params/*, hash*/) {
    return params[0].get(params[1]);
}

export default Ember.Helper.helper(gridData);
