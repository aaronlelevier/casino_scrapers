from django.conf.urls import patterns, url, include

from rest_framework import routers

from contact import views


router = routers.DefaultRouter()
router.register(r'phone_number_types', views.PhoneNumberTypeViewSet)
router.register(r'phone_numbers', views.PhoneNumberViewSet)
router.register(r'addresses', views.AddressViewSet)
router.register(r'address_types', views.AddressTypeViewSet)
router.register(r'emails', views.EmailViewSet)
router.register(r'email_types', views.EmailTypeViewSet)


urlpatterns = patterns('',
    url(r'^api/contact/', include(router.urls)),
    )