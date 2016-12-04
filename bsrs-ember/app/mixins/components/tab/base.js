import Ember from 'ember';

var TabMixin = Ember.Mixin.create({
  tabList: Ember.inject.service(),
  tagName: 'article',
  classNames: ['main'],
  tab() {
    const service = this.get('tabList');
    return service.findTab(this.get('model.id'));
  },
  actions: {
    cancel() {
      /* jshint ignore:start */
      this.attrs.close ? this.sendAction('close', this.tab(), {action: 'cancel'}) : this.get('close')(this.tab(), {action: 'cancel'});
      /* jshint ignore:end */
    }
  }
});

export default TabMixin;
