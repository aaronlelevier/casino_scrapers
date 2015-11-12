import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
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
            this.route('index');
            this.route('new');
            this.route('location', {path: '/:location_id'});
        });
        this.route('categories', function() {
            this.route('index');
            this.route('new');
            this.route('category', {path: '/:category_id'});
        });
        this.route('notifications');
        this.route('assignments');
        this.route('approvals');
        this.route('translations', function() {
            this.route('index');
            this.route('new');
            this.route('translation', {path: '/:translation_key'});
        });
        this.route('people', function() {
            this.route('index');
            this.route('new');
            this.route('person', {path: '/:person_id'});
        });
        this.route('roles', function() {
            this.route('index');
            this.route('new');
            this.route('role', {path: '/:role_id'});
        });
        this.route('location-levels', function() {
            this.route('index');
            this.route('new');
            this.route('location-level', {path: '/:location_level_id'});
        });
        this.route('third-parties', function() {
            this.route('index');
            this.route('new');
            this.route('third-party', {path: '/:third_party_id'});
        });
    });
    this.route('tickets', function() {
        this.route('index');
        this.route('new');
        this.route('ticket', {path: '/:ticket_id'}, function() {
            this.route('activity', {path: '/'});
        });
    });
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
