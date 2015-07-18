from django.conf import settings
from django.conf.urls import include, url, patterns
from django.contrib import admin
from django.core.urlresolvers import reverse
from django.contrib.auth import views as auth_views, forms

from .views import IndexView


admin.autodiscover()

urlpatterns = patterns('',
    # Admin
    url(r'^django-admin/', include(admin.site.urls)),
    # Bigsky Django Views
    url(r'^login/',auth_views.login,
        {'template_name': 'login.html',
        'authentication_form': forms.AuthenticationForm
        },
        name='login'),
    # API
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # My APIs
    url(r'', include('contact.urls')),
    url(r'', include('location.urls')),
    url(r'', include('person.urls')),
    url(r'^.*$', IndexView.as_view(), name='index'),
)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns('',
        url(r'^__debug__/', include(debug_toolbar.urls)),
    )