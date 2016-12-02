import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'login-form',
  classNameBindings: ['active'],
  active: Ember.computed('content', {
    get() {
      return !!this.get('content');
    }
  }),
  content: Ember.computed('rawHtml', {
    get() {
      let html = this.get('rawHtml');
      if (html) {
        let main = parseHTML(html, 'main');
        let form = main.querySelector('form');
        // Using XHR not HTTP to process the form
        form.removeAttribute('action');
        form.removeAttribute('method');
        return main.outerHTML;
      }
    }
  }),
  rawHtml: '',
  doLogin: function() {},
  error: '',
  click(event) {
    if (event.target.className.match(/login__btn/) !== null) {
      let form = event.target.parentElement;
      this.errorHandler(this.element, '');
      let credentials = {
        username: form.querySelector('#id_username').value,
        password: form.querySelector('#id_password').value,
        csrfmiddlewaretoken: form.querySelector('input[name="csrfmiddlewaretoken"]').value
      };
      this.get('doLogin')(credentials).catch((response) => {
        if (response && !(response instanceof Error)) {
          // default REST API form not form.html
          let error = parseHTML(response, '.text-error');
          this.errorHandler(this.element, error.innerText);
        }
      });
    }
    return false;
  },
  errorHandler(elem, error) {
    let fields = elem.querySelector('.login__form-fields');
    if (error !== '') {
      error = htmlToElement(errorHTML(error));
      fields.appendChild(error);
    } else {
      error = fields.querySelector('.errorlist');
      if (error) {
        fields.removeChild(error);
      }
    }
    return error;
  }
});

function errorHTML(error) {
  return `<ul class="errorlist nonfield">
    <li>${error}</li>
  </ul>`;
}

function parseHTML(str, query) {
  let tmp = document.implementation.createHTMLDocument();
  tmp.body.innerHTML = str;
  return tmp.body.querySelector(query);
}

function htmlToElement(html) {
  let template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstChild;
}
