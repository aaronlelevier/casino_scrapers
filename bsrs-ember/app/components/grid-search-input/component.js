import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

var GridSearch =  Ember.TextField.extend({
    val: '',
    classNames: ['t-grid-search-input form-control input-sm'],
    keyUp: function() {
        Ember.run.debounce(this, function() {
            this.sendAction('keyup', this.get('val'));
        }.bind(this), config.DEBOUNCE_TIMEOUT_INTERVAL, false);
    },
    value: Ember.computed('search', {
        get(key){
            return this.get('search');
        },
        set(key, value){
            this.set('val', value);
            return this.get('search');
        }
    })
});

export default GridSearch;
