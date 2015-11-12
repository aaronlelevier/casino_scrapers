import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
    let activity = params[0];
    let type = activity.get('type');
    let person = activity.get('person');
    if(type === 'assignee') {
        let to = activity.get('to');
        let from = activity.get('from');
        return `${person.fullname} changed the assignee from ${to.fullname} to ${from.fullname}`;
    }
    return `${person.fullname} created this ticket`;
});
