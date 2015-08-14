from django.conf import settings
from django.conf.urls import include, url, patterns
from django.contrib import admin
from django.contrib.auth import views as auth_views, forms

from rest_framework import routers

from accounting import views as accounting_views
from bigsky.views import IndexView
from category import views as category_views
from contact import views as contact_views
from location import views as location_views
from person import views as person_views


admin.autodiscover()

router = routers.DefaultRouter()

# ACCOUNTING
router.register(r'currencies', accounting_views.CurrencyViewSet)

# CATEGORY
router.register(r'category_types', category_views.CategoryTypeViewSet)
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


urlpatterns = patterns('',
    # API
    url(r'^api/admin/', include(router.urls)),
    # Admin
    url(r'^django-admin/', include(admin.site.urls)),
    # Bigsky Django Views
    url(r'^login/',auth_views.login,
        {'template_name': 'login.html',
        'authentication_form': forms.AuthenticationForm
        },
        name='login'),
    # DRF AUTH
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^.*$', IndexView.as_view(), name='index'),
    )


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns('',
        url(r'^__debug__/', include(debug_toolbar.urls)),
    )
