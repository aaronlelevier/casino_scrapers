import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
    let activity = params[0];
    let type = activity.get('type');
    let person = activity.get('person');
    if(type !== 'create') {
        let to = activity.get('to.name');
        let from = activity.get('from.name');
        return `${person.fullname} changed the ${type} from ${to} to ${from}`;
    }
    return `${person.fullname} created this ticket`;
});
