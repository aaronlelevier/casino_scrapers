import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Helper.helper(function(params, addon) {
    let timestamp = addon.timestamp;
    let i18n = addon.i18n;
    const activity = params[0];
    const type = activity.get('type');
    const person = activity.get('person');
    if(type === 'create') {
        return i18n.t('activity.ticket.create', {timestamp:timestamp});
    }else if(type === 'cc_add') {
        let message = '';
        const added = activity.get('added');
        const length = added.get('length');
        added.forEach((cc, index) => {
            message = message + cc.get('fullname');
            if(index + 1 < length) {
                message = message + ', ';
            }
        });
        return i18n.t('activity.ticket.cc_add', {added:message, timestamp:timestamp});
    }else if(type === 'cc_remove') {
        let message = '';
        const removed = activity.get('removed');
        const length = removed.get('length');
        removed.forEach((cc, index) => {
            message = message + cc.get('fullname');
            if(index + 1 < length) {
                message = message + ', ';
            }
        });
        return i18n.t('activity.ticket.cc_remove', {removed:message, timestamp:timestamp});
    }
    const to = activity.get('to.name');
    const from = activity.get('from.name');
    return i18n.t('activity.ticket.assignee', {type:type, to:to, from:from, timestamp:timestamp});
});
