import json

from django.conf import settings
from django.conf.urls import include, url, patterns
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views, forms
from django.contrib.auth.decorators import login_required

from rest_framework import routers
from rest_framework.routers import Route, SimpleRouter

from accounting import views as accounting_views
from bigsky import views as bigsky_views
from bigsky.forms import BsAuthenticationForm
from category import views as category_views
from contact import views as contact_views
from decision_tree import views as decision_tree_views
from generic import views as generic_views
from location import views as location_views
from setting import views as setting_views
from third_party import views as third_party_views
from ticket import views as tickets_views
from work_order import views as work_orders_views
from person import views as person_views
from translation import views as translation_views
from utils.decorators import required, logout_required


router = routers.DefaultRouter()

# ACCOUNTING
router.register(r'admin/currencies', accounting_views.CurrencyViewSet)
# DECISION TREE
router.register(r'dtds', decision_tree_views.TreeDataViewSet)
# CATEGORY
router.register(r'admin/categories', category_views.CategoryViewSet)
# CONTACT
router.register(r'admin/phone-numbers', contact_views.PhoneNumberViewSet)
router.register(r'admin/phone-number-types', contact_views.PhoneNumberTypeViewSet)
router.register(r'admin/addresses', contact_views.AddressViewSet)
router.register(r'admin/address-types', contact_views.AddressTypeViewSet)
router.register(r'admin/emails', contact_views.EmailViewSet)
router.register(r'admin/email-types', contact_views.EmailTypeViewSet)
# GENERIC
router.register(r'admin/saved-searches', generic_views.SavedSearchViewSet)
router.register(r'admin/attachments', generic_views.AttachmentViewSet)
router.register(r'admin/settings', setting_views.SettingViewSet)
# LOCATION
router.register(r'admin/locations', location_views.LocationViewSet)
router.register(r'admin/location-levels', location_views.LocationLevelViewSet)
router.register(r'admin/location-statuses', location_views.LocationStatusViewSet)
router.register(r'admin/location-types', location_views.LocationTypeViewSet)
# PERSON
router.register(r'admin/people', person_views.PersonViewSet)
router.register(r'admin/roles', person_views.RoleViewSet)
# THIRD PARTY
router.register(r'admin/third-parties', third_party_views.ThirdPartyViewSet)
# Tickets
router.register(r'tickets', tickets_views.TicketViewSet)
# Work Orders
router.register(r'work-orders', work_orders_views.WorkOrderViewSet)
# TRANSLATION
router.register(r'admin/locales', translation_views.LocaleViewSet)
router.register(r'admin/translations', translation_views.TranslationViewSet)
router.register(r'translations', translation_views.TranslationBootstrapViewSet)


class CustomReadOnlyRouter(SimpleRouter):
    routes = [
        Route(
            url=r'^{prefix}/{lookup}/activity/$',
            mapping={'get': 'list'},
            name='{basename}-detail',
            initkwargs={'suffix': 'Detail'}
        ),
    ]

custom_router = CustomReadOnlyRouter()
custom_router.register('tickets', tickets_views.TicketActivityViewSet)


# API
urlpatterns = [
    url(r'^api/', include(router.urls)),
    url(r'^api/', include(custom_router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]


# No Requirement
urlpatterns += [
    url(r'^404/$', bigsky_views.handler404, name='404'),
    url(r'^500/$', bigsky_views.handler500, name='500'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Logout Required
urlpatterns += required(
    logout_required,
    [
        url(r'^login/', auth_views.login,
            {'template_name': 'form.html',
            'authentication_form': BsAuthenticationForm,
            'extra_context': {
                'submit_button': 'Login'
                }
            },
            name='login'),
    ]
)


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns('',
        url(r'^__debug__/', include(debug_toolbar.urls)),
    )

# Login Required
urlpatterns += required(
    login_required,
    [
        url(r'^password-change/$', auth_views.password_change,
            {'template_name': 'form.html',
            'password_change_form': forms.PasswordChangeForm,
            'post_change_redirect': '/',
            },
            name='password_change'),
        url(r'^logout/$', bigsky_views.logout, name='logout'),
        url(r'^django-admin/', include(admin.site.urls)),
        url(r'', include('generic.urls')),
        # This URL must be the last Django URL defined, or else the URLs defined
        # below it won't resolve, and this URL will catch the URL request.
        url(r'^.*$', bigsky_views.IndexView.as_view(), name='index'),
    ]
)

handler404 = 'bigsky.views.handler404'
handler500 = 'bigsky.views.handler500'

### URL HELPERS

def default_model_ordering():
    """
    Return ``dict`` with:

    - key: the Ember List API route name. i.e. "admin.people.index"
    - value: default ordering in Django Model
    """
    return {".".join(x[0].split('/'))+".index": x[1].queryset.model._meta.ordering
            for x in router.registry}

settings.default_model_ordering = json.dumps(default_model_ordering())
