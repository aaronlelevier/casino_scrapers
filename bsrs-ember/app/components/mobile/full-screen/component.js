import Ember from 'ember';
const { run, get, set } = Ember;
import FullScreenMixin from 'bsrs-ember/mixins/components/full-screen/edit';
import inject from 'bsrs-ember/utilities/inject';

var FullScreen = Ember.Component.extend(FullScreenMixin, {
  activityRepository: inject('activity'),
  mobile: true,
  mobileDialog: false,
  slideInRight: true,
  slideOutRight: false,
  init() {
    this._super(...arguments);
    this.componentStringFunc();
  },
  componentString: '',
  /* @componentStringFunc
   * sets string to be passed to component helper
   */
  componentStringFunc(componentString) {
    const hashComponents = get(this, 'hashComponents');
    componentString = componentString || hashComponents[0].component;
    set(this, 'componentString', componentString);
  },
  actions: {
    save(update) {
      if (get(this, 'model.validations.isValid')) {
        const promise = this._super(update);
        if (promise.then) {
          return promise.then((activities) => {
            return activities;
          });
        }
      }
    },
    delete() {
      this.sendAction('delete', get(this, 'model'), get(this, 'repository'));
    },
    /* @method renderSection
    * Called from clicking on footer item
    */
    renderSection(activeComponent) {
      const hashComponents = get(this, 'hashComponents');
      hashComponents.forEach((componentObj) => {
        if (activeComponent.title === componentObj.title) {
          run(() => {
            set(componentObj, 'active', 'active');
          });
        } else {
          run(() => {
            set(componentObj, 'active', '');
          });
        }
      });
      this.componentStringFunc(activeComponent.component);
    },
    rollback_model() {
      get(this, 'model').rollback();
      get(this, 'close')(get(this, 'redirectRoute'));
    },
    cancel_modal() {
      set(this, 'mobileDialog', false);
    }
  }
});

export default FullScreen;
