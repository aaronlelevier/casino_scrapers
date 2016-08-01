import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('admin-mobile');
  this.route('admin', function() {
    this.route('templates');
    this.route('location-types');
    this.route('category-types');
    this.route('contractors');
    this.route('settings', {path: '/settings/:id'});
    this.route('contractor-assignments');
    this.route('locations', function() {
      this.route('index');
      this.route('new', {path: 'new/:new_id'});
      this.route('location', {path: '/:location_id'});
    });
    this.route('categories', function() {
      this.route('index');
      this.route('new', {path: 'new/:new_id'});
      this.route('category', {path: '/:category_id'});
    });
    this.route('notifications');
    this.route('assignments', function() {
      this.route('index');
      this.route('new', {path: 'new/:new_id'});
      this.route('assignment', {path: '/:assignment_id'});
    });
    this.route('approvals');
    this.route('translations', function() {
      this.route('index');
      this.route('new', {path: 'new/:new_id'});
      this.route('translation', {path: '/:translation_key'});
    });
    this.route('people', function() {
      this.route('index');
      this.route('new', {path: 'new/:new_id'});
      this.route('person', {path: '/:person_id'});
    });
    this.route('profiles', function() {
      this.route('index');
      this.route('profile', {path: '/:profile_id'});
      this.route('new', {path: 'new/:new_id'});
    });
    this.route('roles', function() {
      this.route('index');
      this.route('new', {path: 'new/:new_id'});
      this.route('role', {path: '/:role_id'});
    });
    this.route('location-levels', function() {
      this.route('index');
      this.route('new', {path: 'new/:new_id'});
      this.route('location-level', {path: '/:location_level_id'});
    });
    this.route('third-parties', function() {
      this.route('index');
      this.route('new', {path: 'new/:new_id'});
      this.route('third-party', {path: '/:third_party_id'});
    });
  });
  this.route('tickets', function() {
    this.route('index');
    this.route('new', {path: 'new/:new_id'});
    this.route('ticket', {path: '/:ticket_id'});
  });
  this.route('dtds', function() {
    this.route('new', {path: 'new/:new_id'});
    this.route('dtd', {path: '/:dtd_id'});
    this.route('dtd-error');
  });
  this.route('dt', function() {
    this.route('new', {path: '/new'});
    this.route('dt', {path: '/:dt_id/ticket/:ticket_id'});
    this.route('completed', {path: '/completed/:ticket_id'});
  });
  this.route('work-orders');
  this.route('calendar');
  this.route('search');
  this.route('invoices');
  this.route('reports');
  this.route('phone-number');
  this.route('dashboard', function() {
    this.route('draft');
    this.route('tickets-new');
    this.route('tickets-in-progress');
  });
  this.route('redirect', {path: '/*wildcard'});
  this.route('error');
});

export default Router;
