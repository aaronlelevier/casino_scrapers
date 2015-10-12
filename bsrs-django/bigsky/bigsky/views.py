import json

from django.conf import settings
from django.contrib import auth
from django.core.urlresolvers import reverse
from django.db.models import get_model
from django.http import HttpResponseRedirect
from django.views.generic.base import TemplateView
from django.views.decorators.cache import never_cache
from django.shortcuts import render
from django.utils import timezone

from accounting.models import Currency
from category.models import Category
from contact.models import PhoneNumberType, AddressType
from generic.models import SavedSearch
from person.models import Role, PersonStatus, Person
from ticket.models import TicketStatus, TicketPriority
from location.models import (Location, LocationLevel, LocationStatus,
    State, Country)
from translation.models import Locale
from utils import choices
from utils.helpers import model_to_json, choices_to_json, current_locale


class IndexView(TemplateView):
    '''
    Only Authenticated Users can get to the Home page 
    where the Ember Authenticated App lives.  Else, they
    get redirected to the Login Page.
    '''
    template_name = 'index.html'

    @never_cache
    def dispatch(self, request, *args, **kwargs):
        # test: start
        from django.contrib import messages
        messages.add_message(request, messages.INFO, 'Hello world.')
        # test: end
        
        self.locale = request.META.get('HTTP_ACCEPT_LANGUAGE', None)

        if not request.user.is_authenticated():
            return HttpResponseRedirect(reverse('login'))
        else:
            if request.user.password_expire_date < timezone.now().date():
                return HttpResponseRedirect(reverse('password_change')+
                    '?next='+request.get_full_path())
            return super(IndexView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
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
            'person_current': json.dumps(self.request.user.to_dict(self.locale)),
            'default_model_ordering': settings.default_model_ordering,
            'saved_search': json.dumps(
                SavedSearch.objects.person_saved_searches(self.request.user)),
            'ticket_statuses': model_to_json(TicketStatus),
            'ticket_priorities': model_to_json(TicketPriority),
        })
        return context


def logout(request):
    auth.logout(request)
    return HttpResponseRedirect(reverse('login'))


def relationships_view(request):
    """"Display a list of links for Models that have relationships, 
    and route to the d3js views for each model."""
    models = []
    for model in [Category, Location, LocationLevel, Role]:
        models.append({
            'app_name': model.__module__.split('.')[0],
            'model_name': model.__name__
        })
    return render(request, "relationships.html", {"models": models})


def model_relationships(request, app_name, model_name):
    """Display a d3js relationship diagram."""
    model = get_model(app_name, model_name)
    return render(request, "d3.html", {"json": model.objects.d3_json})
