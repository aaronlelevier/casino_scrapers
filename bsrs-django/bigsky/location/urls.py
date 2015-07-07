from django.conf.urls import patterns, url, include

from rest_framework import routers

from location import views


router = routers.DefaultRouter()
router.register(r'locations', views.LocationViewSet)
router.register(r'locationlevels', views.LocationLevelViewSet)
router.register(r'locationstatus', views.LocationStatusViewSet)
router.register(r'locationtypes', views.LocationTypeViewSet)


urlpatterns = patterns('',
    url(r'^api/location/', include(router.urls)),
    )
