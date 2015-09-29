from django.conf.urls import patterns, url, include

from generic import views


urlpatterns = patterns('',
    url(r'^csv/export_data/$', views.export_data, name="export_data"),
)