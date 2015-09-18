import Ember from 'ember';

var keyup;

var GridSearch =  Ember.TextField.extend({
    classNames: ['t-grid-search-input form-control input-sm'],
    keyUpFunction() {
        this.sendAction('keyup', this.get('value'));
    },
    keyUp: function() {
        Ember.run.debounce(this, this.keyUpFunction, 300, false);
    }
});

export default GridSearch;
