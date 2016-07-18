import Ember from 'ember';
const { Route, inject } = Ember;

export default Ember.Component.extend({
  i18n: inject.service(),
  allCounts: Ember.computed('activities.[]', function() {
    return this.get('activities').get('length');
  }),
  commentCounts: Ember.computed('activities.[]', function() {
    return this.get('activities').filterBy('type', 'comment').get('length');
  }),
  statusCounts: Ember.computed('activities.[]', function() {
    return this.get('activities').filterBy('type', 'status').get('length');
  }),
  actions: {
    filter(filterType, event) {
      Ember.$('.activity-list-tabs li').removeClass('active');
      Ember.$(event.target).addClass('active');
      Ember.$('.activity-list-item').each(function(i, elem) {
        if (!Ember.$(elem).hasClass('activity-create')) {
          switch (filterType) {
            case 'comments':
              if (Ember.$(elem).hasClass('activity-comment')) {
                Ember.$(elem).removeClass('hide');
              } else {
                Ember.$(elem).addClass('hide');
              }
              break;
            case 'status_updates':
              if (Ember.$(elem).hasClass('activity-status')) {
                Ember.$(elem).removeClass('hide');
              } else {
                Ember.$(elem).addClass('hide');
              }
              break;
            default:
              Ember.$(elem).removeClass('hide');
              break;
          }
        }
      });

      if (Ember.$('.activity-list-item').filter(':visible').length === 0) {
        Ember.$('.activity-spacer').hide();
        switch (filterType) {
          case 'comments':
            Ember.$('.activity-empty-comments').removeClass('hide');
            Ember.$('.activity-empty-status_updates').addClass('hide');
            break;
          case 'status_updates':
            Ember.$('.activity-empty-comments').addClass('hide');
            Ember.$('.activity-empty-status_updates').removeClass('hide');
            break;
          default:
            break;
        }
      } else {
        Ember.$('.activity-empty-comments').addClass('hide');
        Ember.$('.activity-empty-status_updates').addClass('hide');
        Ember.$('.activity-spacer').show();
      }

    }
  }
});
