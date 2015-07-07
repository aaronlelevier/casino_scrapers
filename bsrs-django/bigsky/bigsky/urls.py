from django.conf.urls import include, url, patterns
from django.contrib import admin
from django.contrib.auth import views as auth_views, forms


admin.autodiscover()

urlpatterns = patterns('',
    # Login
    url(r'^$',auth_views.login,
        {'template_name': 'login.html',
        'authentication_form': forms.AuthenticationForm},
        name='login'),
    # API
    url(r'', include('contact.urls')),
    url(r'', include('location.urls')),
    url(r'', include('person.urls')),
    url(r'^api-token-auth/', 'rest_framework_jwt.views.obtain_jwt_token'),
    url(r'^api-token-refresh/', 'rest_framework_jwt.views.refresh_jwt_token'),
    # Admin
    url(r'^admin/', include(admin.site.urls)),
)
