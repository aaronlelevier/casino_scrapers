import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    if (params[0] === 'assignee') {
        return 'to-from';
    }else if (params[0] === 'comment') {
        return 'comment-activity';
    }else if (params[0] === 'categories') {
        return 'categories-activity';
    }else if(params[0] === 'create'){
        return 'create-activity';
    }else if(params[0] === 'priority'){
        return 'to-from';
    }else if(params[0] === 'status'){
        return 'to-from'; 
    }else if(params[0] === 'cc_add' || params[0] === 'cc_remove') {
        return 'cc-add-remove';
    }else if(params[0] === 'attachment_add' || params[0] === 'attachment_remove') {
        return 'attachment-add-remove';
    }
});
