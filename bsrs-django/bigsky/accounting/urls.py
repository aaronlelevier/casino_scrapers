from django.conf.urls import patterns, url, include

from rest_framework import routers

from accounting import views


router = routers.DefaultRouter()
router.register(r'currencies', views.CurrencyViewSet)


urlpatterns = patterns('',
    url(r'^api/admin/', include(router.urls)),
    )