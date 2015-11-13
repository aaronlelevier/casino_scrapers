import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
    const activity = params[0];
    const type = activity.get('type');
    const person = activity.get('person');
    if(type === 'create') {
        return `${person.fullname} created this ticket about `;
    }else if(type === 'cc_add') {
        let message = `${person.fullname} added `;
        const added = activity.get('added');
        const length = added.get('length');
        added.forEach((cc, index) => {
            message = message + cc.get('fullname');
            if(index + 1 < length) {
                message = message + ', ';
            }
        });
        return `${message} to CC about `;
    }else if(type === 'cc_remove') {
        let message = `${person.fullname} removed `;
        const removed = activity.get('removed');
        const length = removed.get('length');
        removed.forEach((cc, index) => {
            message = message + cc.get('fullname');
            if(index + 1 < length) {
                message = message + ', ';
            }
        });
        return `${message} from CC about `;
    }
    const to = activity.get('to.name');
    const from = activity.get('from.name');
    return `${person.fullname} changed the ${type} from ${to} to ${from} about `;
});
