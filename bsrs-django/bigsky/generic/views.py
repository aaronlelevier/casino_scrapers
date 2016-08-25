import csv

from django.contrib.auth.models import ContentType
from django.http import HttpResponse

from rest_framework import status
from rest_framework.decorators import list_route
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from generic.models import SavedSearch, Attachment
from generic.serializers import SavedSearchSerializer, AttachmentSerializer
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
    Parse the requested CSV report requested from the Person.

    Requires the POST params:

    :app_name: string
    :model_name: string

    # works if endpoint isn't autorized to output data
    curl -v -H "Content-Type: application/json" -X POST --data '{"model_name": "person", "app_name": "person"}' -u admin:1234 http://localhost:8000/csv/export_data/ --header "Content-Type:application/json"
    """

    def get(self, request, *args, **kwargs):
        model_name = kwargs.get('model_name', None)
        self._set_model(model_name)

        params = {k:v for k, v in request.query_params.items()}
        fields = self._get_fields()

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="{name}.csv"'.format(
            name=self.model._meta.verbose_name_plural)

        writer = csv.writer(response)
        writer.writerow(fields)
        for d in self._filter_with_fields(params, fields):
            writer.writerow([d[f] for f in fields])

        return response

    def _set_model(self, model_name):
        try:
            content_type = ContentType.objects.get(model=model_name)
        except ContentType.DoesNotExist:
            raise ValidationError("Model with model name: {} DoesNotExist"
                                  .format(model_name))
        else:
            self.model = content_type.model_class()

    def _get_fields(self):
        try:
            return self.model.EXPORT_FIELDS
        except AttributeError:
            return [x.name for x in self.model._meta.get_fields()]

    def _filter_with_fields(self, params, fields):
        return self.model.objects.filter(**params).values(*fields)
