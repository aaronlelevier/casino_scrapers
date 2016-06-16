import Ember from 'ember';

export default Ember.Component.extend({
  guid: null,
  triggerOffset: 100,
  didInsertElement() {
    this._super(...arguments);
    this._setupScrollable();
    // this.set('guid', Ember.guidFor(this));
    this._bindEvent();
    this._loadMoreIfNeeded();
  },
  _setupScrollable() {
    this.set('_scrollable', Ember.$('#infinity-loading'));
  },
  _bindEvent() {
    this.get('_scrollable').on('scroll', () => {
      Ember.run.debounce(this, this._loadMoreIfNeeded, 20);
    });
  },
  _selfOffset() {
    /* distance from position of component to top + #infinity-loading distance to top */
    // 1900 + increasing number
    var x = this.$().position().top// + this.get('_scrollable').scrollTop();
    return x;
  },
  /* add the section.main height && distance from top */
  /* scrollTop is # of pixels content of an element is scrolled upwards */
  _bottomOfScrollableOffset() {
    // 507 + increasing number
    var x = this.get('_scrollable').height() + this.get('_scrollable').scrollTop();
    // console.log(x, 'bottom')
    return x;
  },
  _triggerOffset() {
    var x = this._selfOffset() - this.get('triggerOffset');
    // console.log(x, 'offset')
    return x;
  },
  _shouldLoadMore() {
    return this._bottomOfScrollableOffset() > this._triggerOffset();
  },
  _loadMoreIfNeeded() {
    if (this._shouldLoadMore()) {
      console.log('wat')
      const page = this.get('page');
      this.set('page', page + 1);
    }
  },
});
