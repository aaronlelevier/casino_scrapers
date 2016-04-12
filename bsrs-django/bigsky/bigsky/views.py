import json

from django.conf import settings
from django.contrib import auth
from django.core.urlresolvers import reverse
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.views.generic.base import TemplateView
from django.views.decorators.cache import never_cache
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from django.utils import timezone

from accounting.models import Currency
from contact.models import PhoneNumberType, AddressType, EmailType, State, Country
from generic.models import SavedSearch, Attachment
from location.models import LocationLevel, LocationStatus
from person.config import ROLE_TYPES
from person.models import Role, PersonStatus
from setting.models import Setting
from ticket.models import TicketStatus, TicketPriority
from translation.models import Locale
from utils.helpers import model_to_json, model_to_json_select_related, media_path


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
            'email_types_config': model_to_json(EmailType),
            'phone_number_types_config': model_to_json(PhoneNumberType),
            'address_types': model_to_json(AddressType),
            'states_us': model_to_json(State),
            'countries': model_to_json(Country),
            'role_config': model_to_json_select_related(Role, select=['location_level']),
            'role_types_config': json.dumps(ROLE_TYPES),
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
            'settings': model_to_json(Setting),
            'ticket_statuses': model_to_json(TicketStatus),
            'ticket_priorities': model_to_json(TicketPriority),
        })
        return context


def image_full_view(request, id):
    attachment = get_object_or_404(Attachment, id=id)
    response = HttpResponse()
    response["Content-Type"] = ""
    response['X-Accel-Redirect'] = "{}".format(media_path(attachment.image_full))
    return response


def logout(request):
    if request.method not in ('POST', 'PUT'):
        raise Http404
    auth.logout(request)
    return HttpResponseRedirect(reverse('login'))


def handler404(request):
    response = render_to_response('error/404.html', {},
        context_instance=RequestContext(request))
    response.status_code = 404
    return response


def handler500(request):
    response = render_to_response('error/500.html', {},
        context_instance=RequestContext(request))
    response.status_code = 500
    return response
