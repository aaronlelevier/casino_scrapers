import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    if (params[0] === 'assignee') {
        return 'to-from';
    }else if(params[0] === 'create'){
        return 'create-activity'; 
    }else if(params[0] === 'priority' || params[0] === 'status'){
        return 'to-from-without-link'; 
    }else if(params[0] === 'cc_add' || params[0] === 'cc_remove') {
        return 'cc-add-remove'; 
    }
});
