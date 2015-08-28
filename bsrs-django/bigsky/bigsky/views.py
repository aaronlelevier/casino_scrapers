from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.generic.base import TemplateView
from django.views.decorators.cache import never_cache

from contact.models import PhoneNumberType
from person.models import Role, PersonStatus
from location.models import LocationLevel, LocationStatus
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
            'location_status_config': model_to_json(LocationStatus),
            'current_locale': current_locale(self.request.user),
            'locales': model_to_json(Locale)
            })
        return context
