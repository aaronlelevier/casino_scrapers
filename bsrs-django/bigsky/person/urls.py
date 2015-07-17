from django.conf.urls import patterns, url, include

from rest_framework import routers

from person import views


router = routers.DefaultRouter()
router.register(r'people', views.PersonViewSet)
router.register(r'roles', views.RoleViewSet)


urlpatterns = patterns('',
    url(r'^api/admin/', include(router.urls)),
    )