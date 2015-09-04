from django.conf import settings
from django.conf.urls import include, url, patterns
from django.contrib import admin
from django.core.urlresolvers import reverse
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
router.register(r'admin/currencies', accounting_views.CurrencyViewSet)
# CATEGORY
router.register(r'admin/categories', category_views.CategoryViewSet)
# CONTACT
router.register(r'admin/phone_number_types', contact_views.PhoneNumberTypeViewSet)
router.register(r'admin/phone_numbers', contact_views.PhoneNumberViewSet)
router.register(r'admin/addresses', contact_views.AddressViewSet)
router.register(r'admin/address_types', contact_views.AddressTypeViewSet)
router.register(r'admin/emails', contact_views.EmailViewSet)
router.register(r'admin/email_types', contact_views.EmailTypeViewSet)
# LOCATION
router.register(r'admin/locations', location_views.LocationViewSet)
router.register(r'admin/location_levels', location_views.LocationLevelViewSet)
router.register(r'admin/location_statuses', location_views.LocationStatusViewSet)
router.register(r'admin/location_types', location_views.LocationTypeViewSet)
# PERSON
router.register(r'admin/people', person_views.PersonViewSet)
router.register(r'admin/roles', person_views.RoleViewSet)
# TRANSLATION
router.register(r'admin/locales', translation_views.LocaleViewSet)
router.register(r'translations', translation_views.TranslationViewSet)

# API
urlpatterns = patterns('',
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
)


# Logout Required
urlpatterns += required(
    logout_required,
    patterns('',
        url(r'^login/', auth_views.login,
            {'template_name': 'form.html',
            'authentication_form': forms.AuthenticationForm,
            'extra_context': {
                'submit_button': 'Login'
                }
            },
            name='login'),
    )
)

# Login Required
urlpatterns += required(
    login_required,
    patterns('',
        url(r'^password-change/$', auth_views.password_change,
            {'template_name': 'form.html',
            'password_change_form': forms.PasswordChangeForm,
            'post_change_redirect': '/',
            },
            name='password_change'),
        url(r'^django-admin/', include(admin.site.urls)),
        url(r'^.*$', IndexView.as_view(), name='index'),
    )
)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns('',
        url(r'^__debug__/', include(debug_toolbar.urls)),
    )