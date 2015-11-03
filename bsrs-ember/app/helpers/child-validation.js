import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    const submitted = params[0];
    const child_valid = params[1];
    if(submitted) {
        return child_valid ? 'hidden' : '';
    }
    return 'hidden';
});
