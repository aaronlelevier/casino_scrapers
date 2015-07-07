from django.conf.urls import patterns, url, include

from rest_framework import routers

from person import views


router = routers.DefaultRouter()
router.register(r'person', views.PersonViewSet)
router.register(r'person_status', views.PersonStatusViewSet)


urlpatterns = patterns('',
    url(r'^api/person/', include(router.urls)),
    )