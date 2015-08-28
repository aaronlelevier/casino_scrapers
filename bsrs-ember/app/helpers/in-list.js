import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    let ids = params[1].map(function(model) {
        return model.get('id');
    });
    return Ember.$.inArray(params[0], ids) > -1;
});
