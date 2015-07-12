import Ember from 'ember';

export default Ember.Component.extend({
    tagName: "li",
    classNames: ["current-user"],
    init: function() {
        //TODO: change this to person that is logged in
        var firstName = "Andier"; 
        var lastName = "Krier"; 
        var person_id = 3; 
        var name = firstName + " " + lastName;
        this.set('fullName', name);
        this.set('person_id', person_id);
        this._super();
    }//init
});
