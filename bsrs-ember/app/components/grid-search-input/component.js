import Ember from 'ember';

var keyup;

export default Ember.TextField.extend({
    classNames: ['t-grid-search-input form-control'],
    keyUp: function() {
        clearTimeout(keyup);
        keyup = Ember.run.later(this, function() {
            this.sendAction('keyup', this.get('value'));
        }, 200);
    }
});
