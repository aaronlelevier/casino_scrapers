import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
    let activity = params[0];
    let type = activity.get('type');
    let person = activity.get('person');
    if(type === 'create') {
        return `${person.fullname} created this ticket`;
    }else if(type === 'cc_add') {
        let message = `${person.fullname} added `;
        let added = activity.get('added');
        let length = added.get('length');
        added.forEach(function(cc, index) {
            message = message + cc.get('fullname');
            if(index + 1 < length) {
                message = message + ', ';
            }
        });
        return `${message} to CC`;
    }
    let to = activity.get('to.name');
    let from = activity.get('from.name');
    return `${person.fullname} changed the ${type} from ${to} to ${from}`;
});
