from django.conf.urls import url

from generic import views


urlpatterns = [
    url(r'^csv/export_data/$', views.ExportData.as_view(), name="export_data"),
]
