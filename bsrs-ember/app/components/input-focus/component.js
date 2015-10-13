import Ember from 'ember';

var InputFocus = Ember.TextField.extend({
    classNames: ['t-new-entry form-control'],
    becomeFocused: function() {
        this.$().focus();
    }.on('didInsertElement')
});

export default InputFocus;
