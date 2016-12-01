import Ember from 'ember';
const { computed, Component } = Ember;

var toFrom = Component.extend({
  /**
   * @method faIcon
   * @return {String} - fa-icon for activity type
   */
  faIcon: computed(function() {
    switch(this.get('activity.type')) {
      case 'priority':
        return 'exclamation-triangle';
      case 'status':
        return 'clock-o';
      case 'assignee':
        return 'user';
    }
  }),
  spliti18nString: computed(function() {
    const str = this.get('i18nString').string;
    return str.split('%s');
  }),
  /**
   * @method begString
   * @return {String} - changed the assignee from
   */
  begString: computed({
    get() {
      return this.get('spliti18nString')[0];
    }
  }),
  /**
   * @method firstVar
   * @return {String} - Boy2 Man2
   */
  fromString: computed({
    get() {
      return this.get('spliti18nString')[1];
    }
  }),
  /**
   * @method middle
   * @return {String} - to 
   */
  middleString: computed({
    get() {
      return this.get('spliti18nString')[2];
    }
  }),
  /**
   * @method secondVar
   * @return {String} - Boy1 Man1
   */
  toStringValue: computed({
    get() {
      return this.get('spliti18nString')[3];
    }
  }),
  /**
   * @method name
   * @return {String} - person fullname or automation description, etc
   */
  name: computed(function() {
    return this.get('activity').get('person').get('fullname');
  }),
  classNames: ['activity-wrap']
});

export default toFrom;
