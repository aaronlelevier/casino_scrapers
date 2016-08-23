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

    def post(self, request, *args, **kwargs):
        data = request.data
        params = data.get('params', {})
        model = self._get_model(data)
        fields = ['id', 'username']

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="{name}.csv"'.format(
            name=model._meta.verbose_name_plural)

        writer = csv.writer(response)
        writer.writerow(fields)
        for d in self._filter_with_fields(model, params, fields):
            writer.writerow([d[f] for f in fields])

        return response

    @staticmethod
    def _get_model(data):
        try:
            model_name = data.get('model')
            content_type = ContentType.objects.get(model=model_name)
            model = content_type.model_class()
        except ContentType.DoesNotExist:
            raise ValidationError("Model with model name: {} DoesNotExist"
                                  .format(model_name))
        else:
            return model

    @staticmethod
    def _filter_with_fields(model, params, fields):
        return model.objects.filter(**params).values(*fields)
