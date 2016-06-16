import Ember from 'ember';

export default Ember.Component.extend({
  guid: null,
  triggerOffset: 100,
  didInsertElement() {
    this._super(...arguments);
    this._setupScrollableContainer();
    this._bindEvent();
    this._loadMoreIfNeeded();
  },
  /* sets scrollable container that has css overflow:scroll */
  _setupScrollableContainer() {
    this.set('_scrollable', Ember.$('#infinity-loading'));
  },
  /* sets up binding when scroll in _scrollable */
  _bindEvent() {
    this.get('_scrollable').on('scroll', () => {
      Ember.run.debounce(this, this._loadMoreIfNeeded, 20);
    });
  },
  /* distance from position of component to top
  * increases as grid items fill in and add to grid
  * position: returns object {top: px, left: px} relative to next offset parent (that has a position)
  * offset: returns object {top: px, left: px} relative to document
  */
  _selfOffsetFromTop() {
    return this.$().position().top;// + this.get('_scrollable').scrollTop();
  },
  /* add the section.main height && distance from top */
  /* scrollTop is # of pixels content of an element is scrolled upwards */
  _bottomOfScrollableOffset() {
    // 507 + increasing number
    return this.get('_scrollable').height() + this.get('_scrollable').scrollTop();
  },
  _triggerOffset() {
    return this._selfOffsetFromTop() - this.get('triggerOffset');
  },
  /* shouldLoadMore when the scrollable container is scrolled the same amount of pixels that is greater than the (static) distance of this component form the top */
  _shouldLoadMore() {
    return this._bottomOfScrollableOffset() > Math.max(1000, this._triggerOffset());
  },
  _loadMoreIfNeeded() {
    if (this._shouldLoadMore()) {
      const page = this.get('page');
      this.set('page', page + 1);
    }
  },
});
