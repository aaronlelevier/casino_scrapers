import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

const PAGE_SIZE = config.APP.PAGE_SIZE;

//TODO: reset grid options if deep link on mobile
//TODO: if deep link to last page, then need to prevent error

export default Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  triggerOffset: 100,
  reachedInfinity: false,
  didInsertElement() {
    this._super(...arguments);
    this._setupScrollableContainer();
    this._bindEvent();
    this._loadMoreIfNeeded();
  },
  /* unbind scroll event when navigate away from component */
  willDestroyElement() {
    this._super(...arguments);
    this._unbindEvent();
    this.get('simpleStore').clear(`${this.get('noun')}-list`);
  },
  /* sets scrollable container that has css overflow:scroll */
  _setupScrollableContainer() {
    this.set('_scrollable', Ember.$('#infinity-loading'));
  },
  /* sets up binding when scroll in _scrollable */
  _bindEvent() {
    this.get('_scrollable').on('scroll', () => {
      Ember.run.debounce(this, this._loadMoreIfNeeded, 10);
    });
  },
  _unbindEvent() {
    this.get('_scrollable').off('scroll');
  },
  /* @method _selfOffsetFromTop
  * distance from position of component to top
  * increases as grid items fill in and add to grid
  * position: returns object {top: px, left: px} relative to next offset parent (that has a position)
  * offset: returns object {top: px, left: px} relative to document
  */
  _selfOffsetFromTop() {
    return this.$().position().top;
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
  /* @method _shouldLoadMore
  * shouldLoadMore when the scrollable container is scrolled the same amount of pixels that is greater than the (static) distance of this component form the top
  */
  _shouldLoadMore() {
    return this._bottomOfScrollableOffset() > this._triggerOffset();
  },
  /* @method _canLoadMore
  * if no count, model has not yet loaded.
  */
  _canLoadMore() {
    const count = this.get('model').get('count');
    const totalPages = Math.ceil(count/PAGE_SIZE);
    return count ? this.get('page') < totalPages : true;
  },
  /* @method _loadMoreIfNeeded
  * increment page (start at 1) after reach infinity-component
  */
  _loadMoreIfNeeded() {
    const canLoadMore = this._canLoadMore();
    if (this._shouldLoadMore() && canLoadMore && !this.get('reachedInfinity')) {
      const page = this.get('page');
      this.set('page', page + 1);
    } else if (!canLoadMore) {
      this.set('reachedInfinity', true);
    }
  },
});
