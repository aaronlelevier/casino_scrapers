import Ember from 'ember';
import { htmlSafe } from 'ember-string';

export default Ember.Component.extend({
  attributeBindings: ['style'],
  classNames: ['dashboard-add-new'],
  /*
   * @method mouseLeave
   * if mouse inside component, trigger leave b/c parent tab-list wont trigger
   */
  mouseLeave() {
    this.get('closeTask').perform();
  },
  /**
   * @method mouseEnter
   * 1. came back into the component and should cancel all outstanding tasks in order to avoid exiting 
   * and entering inside DEBOUNCE_MS and having component close itself
   * 2. call parent function keepMeOpen - cancel all tasks to avoid mutating isOpen flag b/c we want to stay open!
   */
  mouseEnter() {
    this.get('closeTask').cancelAll();
    this.get('keepMeOpen')();
  },
  style: Ember.computed('left', function() {
    let { left, top } = this.getProperties('left', 'top');
    let style = '';
    if (left) {
      style += `left: ${left};`;
    }
    if (top) {
      style += `top: ${top};`;
    }
    if (style.length > 0) {
      return htmlSafe(style);
    }
  }),
  actions: {
    linkToNew(type, add_model_url) {
      this.get('linkToNew')(type, add_model_url);
      this.set('isOpen', false);
    }
  }
});
