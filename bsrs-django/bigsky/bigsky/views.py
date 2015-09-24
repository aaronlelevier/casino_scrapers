import json

from django.conf import settings
from django.core.urlresolvers import reverse
from django.db.models import get_model
from django.http import HttpResponseRedirect
from django.views.generic.base import TemplateView
from django.views.decorators.cache import never_cache
from django.shortcuts import render
from django.utils import timezone

from accounting.models import Currency
# from bigsky.urls import default_model_ordering
from category.models import Category
from contact.models import PhoneNumberType, AddressType
from person.models import Role, PersonStatus, Person
from location.models import (Location, LocationLevel, LocationStatus,
    State, Country)
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
            'default_model_ordering': settings.default_model_ordering
            })
        return context


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