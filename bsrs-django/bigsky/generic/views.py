import csv
import datetime
import os

from django.conf import settings
from django.contrib.auth.models import ContentType
from django.http import HttpResponse
from django.utils.timezone import localtime, now

from rest_framework import status
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from generic.models import SavedSearch, Attachment
from generic.serializers import SavedSearchSerializer, AttachmentSerializer
from translation.models import Translation
from utils.helpers import local_strftime
from utils.views import BaseModelViewSet


### API

class SavedSearchViewSet(BaseModelViewSet):

    model = SavedSearch
    permission_classes = (IsAuthenticated,)
    serializer_class = SavedSearchSerializer
    queryset = SavedSearch.objects.all()

    def perform_create(self, serializer):
        serializer.save(person=self.request.user)


class AttachmentViewSet(BaseModelViewSet):
    """
    ## Detail Routes

    **1. batch-delete:**

       Batch delete Attachments. Send a `delete` request with a payload of
       `{ids: [id1, id2, etc...]}`

       URL: `/api/admin/attachments/batch-delete/`
    """

    model = Attachment
    permission_classes = (IsAuthenticated,)
    serializer_class = AttachmentSerializer
    queryset = Attachment.objects.all()

    @list_route(methods=['delete'], url_path=r"batch-delete")
    def batch_delete(self, request):
        ids = request.data.get('ids', None)
        if ids:
            for id in ids:
                try:
                    Attachment.objects.get(id=id).delete(override=True)
                except Attachment.DoesNotExist:
                    pass
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_200_OK)


class ExportData(APIView):
    """
    Parse the requested data from the query params, then return the
    URL path to the file.
    """
    downloads_sub_path = 'downloads/'

    def get(self, request, *args, **kwargs):
        model_name = kwargs.get('model_name', None)
        self._set_model(model_name)

        filename = self._filename_with_datestamp(model_name)
        filepath =  os.path.join(settings.MEDIA_ROOT,
                                "{}{}".format(self.downloads_sub_path, filename))
        self._write_file(filepath, request.query_params)

        return HttpResponse("{}{}{}".format(settings.MEDIA_URL,
                                            self.downloads_sub_path, filename))

    def _set_model(self, model_name):
        """
        All exportable grids should be able to retrieve the model
        class via this method.
        """
        try:
            model = self._resolve_model_name(model_name)
            content_type = ContentType.objects.get(model=model)
        except ContentType.DoesNotExist:
            raise ValidationError("Model with model name: {} DoesNotExist"
                                  .format(model_name))
        else:
            self.model = content_type.model_class()

    def _resolve_model_name(self, model_name):
        """This method resolves name differences between the string
        name used by Django's ContentType class and the model name
        'type' string used in each Ember repository."""
        name_mapper = {
            'dtd': 'treedata',
            'location-level': 'locationlevel'
        }
        try:
            return name_mapper[model_name]
        except KeyError:
            return model_name

    @staticmethod
    def _filename_with_datestamp(model_name):
        iso_format_date = localtime(now()).date().isoformat().replace('-', '')
        return "{}_{}.csv".format(model_name, iso_format_date)

    def _write_file(self, filepath, query_params):
        with open(filepath, 'w', newline='') as csvfile:
            translation_values = self.request.user.translation_values

            writer = csv.writer(csvfile, delimiter=',')
            writer.writerow([translation_values.get(h, h)for h in self.model.I18N_HEADER_FIELDS])

            for obj in self._filter_with_fields(query_params):
                values = self._get_values_to_write(translation_values, obj)
                writer.writerow(values)

    def _filter_with_fields(self, query_params):
        return self.model.objects.filter_export_data(query_params)

    def _get_values_to_write(self, translation_values, obj):
        values = []
        for f in self.model.export_fields:
            if hasattr(obj, 'I18N_FIELDS') and f in self.model.I18N_FIELDS:
                values.append(Translation.resolve_i18n_value(translation_values, obj, f))
            else:
                v = getattr(obj, f)
                if isinstance(v, datetime.datetime):
                    args = [v]
                    tzname = self.request.session.get('timezone', None)
                    if tzname:
                        args.append(tzname)
                    values.append(local_strftime(*args))
                else:
                    values.append(v)
        return values
