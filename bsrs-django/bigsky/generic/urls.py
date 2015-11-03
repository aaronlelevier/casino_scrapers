from django.conf.urls import patterns, url

from generic import views


urlpatterns = patterns('',
    url(r'^csv/export_data/$', views.ExportData.as_view(), name="export_data"),
)