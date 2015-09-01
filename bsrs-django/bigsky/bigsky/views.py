import json

from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.generic.base import TemplateView
from django.views.decorators.cache import never_cache

from accounting.models import Currency
from contact.models import PhoneNumberType, AddressType
from person.models import Role, PersonStatus, Person
from location.models import LocationLevel, LocationStatus, State, Country
from translation.models import Locale
from util import choices
from util.helpers import model_to_json, choices_to_json, current_locale


class IndexView(TemplateView):
    '''
    Only Authenticated Users can get to the Home page 
    where the Ember Authenticated App lives.  Else, they
    get redirected to the Login Page.
    '''
    template_name = 'index.html'

    @never_cache
    def dispatch(self, request, *args, **kwargs):
        print 'request.LANGUAGE_CODE:', request.LANGUAGE_CODE
        print 'HTTP_ACCEPT_LANGUAGE:', request.META.get('HTTP_ACCEPT_LANGUAGE', None)
        self.locale = request.META.get('HTTP_ACCEPT_LANGUAGE', None)

        if not request.user.is_authenticated():
            return HttpResponseRedirect(reverse('login'))
        else:
            return super(IndexView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        print 'context:', self.request.META.get('HTTP_ACCEPT_LANGUAGE', None)
        context = super(IndexView, self).get_context_data(**kwargs)
        context.update({
            'phone_number_types_config': model_to_json(PhoneNumberType),
            'address_types': model_to_json(AddressType),
            'states_us': model_to_json(State),
            'countries': model_to_json(Country),
            'role_config': model_to_json(Role),
            'role_types_config': choices_to_json(choices.ROLE_TYPE_CHOICES),
            'person_status_config': model_to_json(PersonStatus),
            'location_level_config': model_to_json(LocationLevel),
            'location_status_config': model_to_json(LocationStatus),
            'locales': model_to_json(Locale),
            'currencies': json.dumps({c.code: c.to_dict()
                                      for c in Currency.objects.all()}),
            'person_current': json.dumps(self.request.user.to_dict(self.locale))
            })
        return context
