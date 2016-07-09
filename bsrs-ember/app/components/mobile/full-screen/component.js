import Ember from 'ember';
import FullScreenMixin from 'bsrs-ember/mixins/components/full-screen/edit';

var FullScreen = Ember.Component.extend(FullScreenMixin, {
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
    save() {
      this._super();
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
