import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = config.APP.POWER_SELECT_DEBOUNCE;

var GridSearch =  Ember.TextField.extend({
  val: '',
  type: 'search',
  //TODO: test type and autocapitalize
  autocapitalize: 'none',
  classNames: ['t-grid-search-input form-control input-sm'],
  didInsertElement() {
    this._super(...arguments);
    if (this.get('focusInput')) {
      //TODO: This is not working right now
      this.$().focus();
    }
  },
  sendValueUp: task(function * () {
    yield timeout(DEBOUNCE_MS);
    // need to trim spaces if user types space a bunch of times
    this.sendAction('keyup', this.get('val').trim());
  }).restartable(),
  keyUp: function() {
    this.get('sendValueUp').perform();
  },
  value: Ember.computed('search', {
    get(){
      return this.get('search');
    },
    set(key, value){
      this.set('val', value);
      return this.get('search');
    }
  })
});

export default GridSearch;
