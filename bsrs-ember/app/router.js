import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('admin', function() {
    this.route('templates');
    this.route('location-types');
    this.route('category-types');
    this.route('contractors');
    this.route('general');
    this.route('contractor-assignments');
    this.route('locations', function() {
        this.route('location', {path: '/:location_id'});
        this.route('new');
    });
    this.route('categories');
    this.route('notifications');
    this.route('assignments');
    this.route('approvals');
    this.route('people', function() {
      this.route('new');
      this.route('person', {path: '/:person_id'});
    });
    this.route('roles', function() {
      this.route('new');
      this.route('role', {path: '/:role_id'});
    });
    this.route('locationlevels');
    this.route('locationlevel', {path: '/locationlevels/:loc_id'}, function() {});
  });
  this.route('tickets');

  this.route('work-orders');
  this.route('purchase-orders');
  this.route('tasks');
  this.route('projects');
  this.route('rfqs');
  this.route('pm');
  this.route('assets');
  this.route('calendar');
  this.route('search');
  this.route('pms');
  this.route('invoices');
  this.route('reports');
  this.route('phone-number');
  this.route('dashboard');
});

export default Router;
