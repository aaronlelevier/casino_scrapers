import Ember from 'ember';

var DTDSRoute = Ember.Route.extend({
  renderTemplate(){
    this.render('dtds.dtd-error', {
      into: 'dtds',
      outlet: 'detail'
    });
    this.render('components.dtds.dtd-preview', {
      into: 'dtds',
      outlet: 'preview'
    });
  },
});

export default DTDSRoute;
