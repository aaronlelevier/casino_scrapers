import Ember from 'ember';

export default Ember.Component.extend({
  labelOutlet: Ember.computed('field.label', 'field.type', function() {
    const className = 't-dtd-field-preview';
    const field = this.get('field');
    const label = field.get('label');
    const types = field.get('types');
    switch(field.get('type')) {
      case types[0]:
        return Ember.String.htmlSafe(`<label for='dtd-field-preview' class='t-dtd-field-label-preview'>${label}</label>
                                     <input id='dtd-field-preview' type='text' class='form-control t-dtd-field-preview'>`);
      case types[1]:
        return Ember.String.htmlSafe(`<label for="dtd-field-preview" class="t-dtd-field-label-preview">${label}</label>
                                      <input id="dtd-field-preview" type="number" class="form-control t-dtd-field-preview">`);
        // case types[2]:
        //   return Ember.HTMLBars.compile(`<textarea class='${className}' value=${label} />`);
        // case types[3]:
        //   return Ember.HTMLBars.compile(`<select>${label}</select>`);
        // case types[4]:
        //   return Ember.HTMLBars.compile(`<h2>${label}</h2>`);//with_options
        // case types[5]:
        //   return Ember.HTMLBars.compile(`{{input type='checkbox' checked={{}} class='${className} form-control t-dtd-field-required'}}`);
        // case types[6]:
        //   return Ember.HTMLBars.compile(`<span class='${className} btn btn-default btn-file'>{{fa-icon 'paperclip'}} {{t 'button.upload'}}<input type='file' multiple='multiple' onchange={{action 'upload'}}></span>`);
      default:
        break;
    }
  }) 
});
