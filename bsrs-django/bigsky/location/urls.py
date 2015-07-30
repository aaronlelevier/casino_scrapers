from django.conf.urls import patterns, url, include

from rest_framework import routers

from location import views


router = routers.DefaultRouter()
router.register(r'locations', views.LocationViewSet)
router.register(r'location_levels', views.LocationLevelViewSet)
router.register(r'location_statuses', views.LocationStatusViewSet)
router.register(r'location_types', views.LocationTypeViewSet)


urlpatterns = patterns('',
    url(r'^api/admin/location/', include(router.urls)),
    )
