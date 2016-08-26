import Ember from 'ember';
import FullScreenMixin from 'bsrs-ember/mixins/components/full-screen/edit';
import inject from 'bsrs-ember/utilities/inject';

var FullScreen = Ember.Component.extend(FullScreenMixin, {
  activityRepository: inject('activity'),
  mobile: true,
  mobileDialog: false,
  init() {
    this._super(...arguments);
    this.componentStringFunc();
  },
  componentString: '',
  componentStringFunc(componentString) {
    const hashComponents = this.get('hashComponents');
    componentString = componentString || hashComponents[0].component;
    this.set('componentString', componentString);
  },
  actions: {
    save(update) {
      const promise = this._super(update);
      if (promise.then) {
        return promise.then((activities) => {
          return activities;
        });
      }
    },
    delete() {
      this.sendAction('delete', this.get('model'), this.get('repository'));
    },
    /*
    * Called from clicking on footer item
    */
    renderSection(activeComponent) {
      const hashComponents = this.get('hashComponents');
      hashComponents.forEach((componentObj) => {
        if (activeComponent.title === componentObj.title) {
          Ember.set(componentObj, 'active', 'active');
        } else {
          Ember.set(componentObj, 'active', '');
        }
      });
      this.componentStringFunc(activeComponent.component);
    },
    rollback_model() {

    },
    cancel_modal() {
      this.set('mobileDialog', false);
    }
  }
});

export default FullScreen;
