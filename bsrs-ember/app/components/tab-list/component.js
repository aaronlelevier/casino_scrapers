import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { run, set } = Ember;
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = config.APP.POWER_SELECT_DEBOUNCE;

var TabList = Ember.Component.extend({
  isOpen: false,
  didInsertElement() {
    this._super(...arguments);
    this.reposition();
  },

  /* TWO GENERATOR FUNCTIONS */

  /**
   * @method closeTask
   * generator function that will close the child component
   */
  closeTask: task(function * (e) {
    yield timeout(DEBOUNCE_MS);
    this.set('isOpen', false);
  }).restartable(),
  /**
   * @method setIsOpen
   * concurrency task that will restart if hover out
   * set isOpen to false if move mouse outside of left, right or top bounds of + sign
   * .new class name is on + button
   */
  setIsOpen: task(function * (e) {
    let { top, left } = document.getElementById(`${this.get('elementId')}`).getElementsByClassName('new')[0].getBoundingClientRect();
    yield timeout(DEBOUNCE_MS);
    if (e.clientY > top && e.clientX >= left && e.clientX < (left + 36)) {
      yield this.set('isOpen', true);
    } else {
      yield this.set('isOpen', false);
    }
    this.reposition();
  }).restartable(),

  /* END GENERATOR FUNCTIONS */

  /**
   * @method reposition
   * get top, left and height to calculate position of dropdown
   * 250 is the min width of the child dashboard-add-new component.  May need a class to add instead of hard-coding it
   */
  reposition() {
    let { width: bodyWidth } = document.body.getBoundingClientRect();
    let { top, left, width, height } = document.getElementById(`${this.get('elementId')}`).getElementsByClassName('new')[0].getBoundingClientRect();
    if (left > (bodyWidth - 125)) {
      set(this, 'left', `${left - 251 + width }px`);
    } else {
      set(this, 'left', `${left - 1}px`);
      set(this, 'top', `${top + height - 1}px`);
    }
  },
  actions: {
    linkToNew() {
      this.get('linkToNew')().then(() => {
        this.set('isOpen', false);
        this.reposition();
      });
    },
    closeTab(tab){
      this.get('closeTabMaster')(tab, {action:'closeTab'});
    },
    /**
     * @method toggleNewModuleList
     * 1. on enter or exit, set isOpen flag accordingly &&
     * 2. cancel any tasks the child has going on - move mouse from child -> to outside of both -> to parent 
     */
    toggleNewModuleList(e) {
      this.get('setIsOpen').perform(e);
      this.get('closeTask').cancelAll();
    },
    /**
     * @method keepMeOpen
     * passes to child component to cancel all parent  tasks that are outstanding to prevent mouse moving from +, outside +, then into child component
     * move mouse from parent -> to outside of both -> to child and prevent any tasks parent had going on
     */
    keepMeOpen() {
      this.get('setIsOpen').cancelAll();
    },
  }
});

export default TabList;
