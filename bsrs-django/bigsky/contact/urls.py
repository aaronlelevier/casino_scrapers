from django.conf.urls import patterns, url, include

from rest_framework import routers

from contact import views


router = routers.DefaultRouter()
router.register(r'phonenumbers', views.PhoneNumberViewSet)
router.register(r'phonenumbertypes', views.PhoneNumberTypeViewSet)
router.register(r'addresses', views.AddressViewSet)
router.register(r'addresstypes', views.AddressTypeViewSet)
router.register(r'emails', views.EmailViewSet)
router.register(r'emailtypes', views.EmailTypeViewSet)


urlpatterns = patterns('',
    url(r'^api/contact/', include(router.urls)),
    )