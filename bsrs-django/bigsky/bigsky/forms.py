from django.contrib.auth.forms import AuthenticationForm

from person.models import Person


class BsAuthenticationForm(AuthenticationForm):

    class Meta:
        model = Person

    def __init__(self, *args, **kwargs):
        super(BsAuthenticationForm, self).__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'type' : 'text'})
        self.fields['password'].widget.attrs.update({'type' : 'password'})
