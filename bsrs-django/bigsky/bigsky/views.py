import json

from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.generic.base import TemplateView
from django.shortcuts import render
from django.forms.models import model_to_dict
from contact.models import PhoneNumberType


def generate_phone_number_type_configuration(configuration=[]):
    data = PhoneNumberType.objects.all()
    for item in data:
        configuration.append(model_to_dict(item))
    return json.dumps(configuration)


class IndexView(TemplateView):
    '''
    Only Authenticated Users can get to the Home page 
    where the Ember Authenticated App lives.  Else, they
    get redirected to the Login Page.
    '''
    template_name = 'index.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponseRedirect(reverse('login'))
        else:
            return render(request, 'index.html', {
                'phone_number_types_config': generate_phone_number_type_configuration()
                })
