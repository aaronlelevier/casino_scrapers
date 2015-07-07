import Ember from 'ember';

export default Ember.ContainerView.extend({
  tagName: 'div',
  classNames: ['form-group'],

  init: function() {
    this._super();
    Ember.run.once(this, this.appendComponent());
  },

  appendComponent: function() {
    var emailArray = this.get('controller.emailArray');//controller is input-multi controller
    var component = this.get('inputFields');
    console.log(emailArray.length);
    emailArray.forEach((email) => {
      this.pushObject(Ember.View.create({
        tagName: 'input',
        classNames: ['form-control new'],
        render: function(buffer) {
          buffer.push("hist");
        }
      }));
    });
  //   /* NEEDS TO BE AN INSTANCE OF EMBER.VIEW */
  //   // console.log(this.get('controller'));
  //   var component = this.get('inputFields');
  //   var controller = this.container.lookup('controller:admin.people.new');
  //   var emailArray = controller.emailArray;
  //   // console.log(controller.emailArray.length);
  //   // this.set('currentInput', this.createChildView(component));
  //   // emailArray.forEach((email) => {
  //   //   this.pushObject(this.get('currentInput'));
  //   // });
  //
  }.observes('controller.emailArray')
});
