from django.conf import settings
from django.conf.urls import include, url, patterns
from django.contrib import admin
from django.contrib.auth import views as auth_views, forms
from django.contrib.auth.decorators import login_required

from rest_framework import routers

from accounting import views as accounting_views
from bigsky.views import IndexView
from category import views as category_views
from contact import views as contact_views
from location import views as location_views
from person import views as person_views
from translation import views as translation_views
from util.decorators import required, logout_required


admin.autodiscover()

router = routers.DefaultRouter()

# ACCOUNTING
router.register(r'currencies', accounting_views.CurrencyViewSet)
# CATEGORY
router.register(r'categories', category_views.CategoryViewSet)
# CONTACT
router.register(r'phone_number_types', contact_views.PhoneNumberTypeViewSet)
router.register(r'phone_numbers', contact_views.PhoneNumberViewSet)
router.register(r'addresses', contact_views.AddressViewSet)
router.register(r'address_types', contact_views.AddressTypeViewSet)
router.register(r'emails', contact_views.EmailViewSet)
router.register(r'email_types', contact_views.EmailTypeViewSet)
# LOCATION
router.register(r'locations', location_views.LocationViewSet)
router.register(r'location_levels', location_views.LocationLevelViewSet)
router.register(r'location_statuses', location_views.LocationStatusViewSet)
router.register(r'location_types', location_views.LocationTypeViewSet)
# PERSON
router.register(r'people', person_views.PersonViewSet)
router.register(r'roles', person_views.RoleViewSet)
# TRANSLATION
router.register(r'locales', translation_views.LocaleViewSet)
router.register(r'translations', translation_views.TranslationViewSet)

# API
urlpatterns = patterns('',
    url(r'^api/admin/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
)

# Logout Required
urlpatterns += required(
    logout_required,
    patterns('',
        url(r'^login/', auth_views.login,
            {'template_name': 'login.html',
            'authentication_form': forms.AuthenticationForm
            },
            name='login'),
    )
)

# Login Required
urlpatterns += required(
    login_required,
    patterns('',
        url(r'^django-admin/', include(admin.site.urls)),
        url(r'^.*$', IndexView.as_view(), name='index'),
    )
)


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns('',
        url(r'^__debug__/', include(debug_toolbar.urls)),
    )