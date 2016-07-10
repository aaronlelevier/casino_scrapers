import Ember from 'ember';
import FullScreenMixin from 'bsrs-ember/mixins/components/full-screen/edit';
import inject from 'bsrs-ember/utilities/inject';

var FullScreen = Ember.Component.extend(FullScreenMixin, {
  activityRepository: inject('activity'),
  init() {
    this._super();
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
    cancel() {
      this._super();
    },
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
  }
});

export default FullScreen;
