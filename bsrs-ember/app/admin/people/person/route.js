import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var PersonRoute = TabRoute.extend(FindById, {
  repository: inject('person'),
  i18n: Ember.inject.service(),
  queryParams: {
    role_change: {
      refreshModel: true
    }
  },
  redirectRoute: 'admin.people.index',
  module: 'person',
  templateModelField: Ember.computed(function() { return 'fullname'; }),
  model(params, transition) {
    const pk = params.person_id;
    const repository = this.get('repository');
    const role_change = transition.queryParams.role_change;
    let person = repository.fetch(pk);
    /* Person's role is dirty, then always fetch. Why would I do that? */
    const override = person.get('roleIsDirty');
    /* MOBILE SPECIFIC */
    const hashComponents = [
      {'title': this.get('i18n').t('admin.person.section.details'), 'component': 'people/detail-section', active: 'active'},
      {'title': this.get('i18n').t('admin.person.section.credentials'), 'component': 'people/credentials-section', active: ''},
      {'title': this.get('i18n').t('admin.person.section.contact'), 'component': 'people/contact-section', active: ''},
    ];
    return this.findByIdScenario(person, pk, {role_change:role_change, hashComponents:hashComponents, repository: repository}, override);
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});

export default PersonRoute;
