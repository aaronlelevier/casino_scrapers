import Ember from 'ember';

var TPrefix = Ember.Helper.helper((params) => {
    return params[0] + '.' + params[1].replace('.', '-').replace('translated_name', 'name');
});

export default TPrefix;
