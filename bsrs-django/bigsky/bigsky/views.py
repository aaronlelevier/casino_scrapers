import json

from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.generic.base import TemplateView
from django.shortcuts import render

from contact.models import PhoneNumberType
from person.models import Role, PersonStatus
from location.models import LocationLevel, LocationStatus

from util import choices

def model_to_json(model):
    return json.dumps([m.to_dict() for m in model.objects.all()])

def choices_to_json(model):
    return json.dumps([m[0] for m in model])


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
            return super(IndexView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        context.update({
            'phone_number_types_config': model_to_json(PhoneNumberType),
            'role_config': model_to_json(Role),
            'role_types_config': choices_to_json(choices.ROLE_TYPE_CHOICES),
            'person_status_config': model_to_json(PersonStatus),
            'location_level_config': model_to_json(LocationLevel),
            'location_status_config': model_to_json(LocationStatus)
            })
        return context
