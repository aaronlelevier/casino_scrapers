import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['form-group'],
  labelOutlet: Ember.computed('field.label', 'field.type', function() {
    const className = 't-dtd-field-preview';
    const field = this.get('field');
    const label = field.get('label') || '';
    const types = field.get('types');
    switch(field.get('type')) {
      case types[0]:
        return Ember.String.htmlSafe(`<label for='dtd-field-preview' class='t-dtd-field-label-preview'>${label}</label>
                                     <input id='dtd-field-preview' type='text' class='form-control t-dtd-field-preview'>`);
      case types[1]:
        return Ember.String.htmlSafe(`<label for='dtd-field-preview' class='t-dtd-field-label-preview'>${label}</label>
                                      <input id='dtd-field-preview' type='number' class='form-control t-dtd-field-preview'>`);
      case types[2]:
        return Ember.String.htmlSafe(`<textarea autoresize=true id='dtd-field-preview' class='form-control ${className}' />`);
      case types[3]:
        const options = field.get('options').reduce((prev, option) => {
          return prev += `<option>${option.get('text')}</option>`;
        }, '');
        return Ember.String.htmlSafe(`<label for='dtd-field-preview' class='t-dtd-field-label-preview'>${label}</label>
                                      <select id='dtd-field-preview' class='form-control t-dtd-field-preview'>
                                      ${options}
                                      </select>
                                     `);
      case types[4]:
        const with_options_options = field.get('options').reduce((prev, option) => {
          return prev += `<div class='checkbox t-dtd-field-preview-option'><label><input type='checkbox'><span>${option.get('text')}</span></label></div>`;
        }, '');
        return Ember.String.htmlSafe(`<label for='dtd-field-preview' class='t-dtd-field-label-preview'>${label}</label>
                                     ${with_options_options}
                                     `);
        // case types[5]:
        //   return Ember.String.htmlSafe(`{{input type='checkbox' checked={{}} class='${className} form-control t-dtd-field-required'}}`);
        // case types[6]:
        //   return Ember.String.htmlSafe(`<span class='${className} btn btn-default btn-file'>{{fa-icon 'paperclip'}} {{t 'button.upload'}}<input type='file' multiple='multiple' onchange={{action 'upload'}}></span>`);
      default:
        break;
    }
  }) 
});
