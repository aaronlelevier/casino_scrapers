import csv
import json

from django.core.exceptions import PermissionDenied
from django.db.models.loading import get_model
from django.http import HttpResponse
from django.views.generic import View

from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from generic.models import SavedSearch
from generic.serializers import SavedSearchSerializer
from util.views import BaseModelViewSet


### API

class SavedSearchViewSet(BaseModelViewSet):
    
    permission_classes = (IsAuthenticated,)
    serializer_class = SavedSearchSerializer
    queryset = SavedSearch.objects.all()

    def perform_create(self, serializer):
        serializer.save(person=self.request.user)


def export_static(request):
    # Create the HttpResponse object with the appropriate CSV header.
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="somefilename.csv"'

    writer = csv.writer(response)
    writer.writerow(['First row', 'Foo', 'Bar', 'Baz'])
    writer.writerow(['Second row', 'A', 'B', 'C', '"Testing"', "Here's a quote"])

    return response


### EXPORT DATA

from rest_framework.views import APIView

class ExportData(APIView):
    """
    Parse the requested CSV report requested from the Person.

    Requires the POST params:

    :app_name: string
    :model_name: string
    :query_params: dict - filters, sorting, etc.  TBD: Django ORM, or need to convert from Ember ??
    :fields: array - Person defined fields to output
    """

    def dispatch(self, request, *args, **kwargs):
        if request.method.lower() != u'post':
            raise PermissionDenied("{} not allowed".format(request.method.lower()))
        return super(ExportData, self).dispatch(request, *args, **kwargs)

    def set_model_and_fields(self, data):
        try:
            self.app_name = data.get('app_name')
            self.model_name = data.get('model_name')
            self.model = get_model(self.app_name, self.model_name)
            self.fields = data.get('fields')
            self.query_params = data.get('query_params')
        except KeyError as e:
            raise ValidationError(str(e))

    def validate_required(self):
        required = [self.app_name, self.model_name, self.model, self.fields, self.query_params]
        if not all(required):
            raise ValidationError("Required arguments missing: {}".format(required))

    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        self.set_model_and_fields(data)
        self.validate_required()

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="{name}.csv"'.format(
            name=self.model._meta.verbose_name_plural)

        writer = csv.writer(response)
        writer.writerow(self.fields)

        # Data
        for obj in self.model.objects.filter(**self.query_params):
            writer.writerow([str(getattr(obj, field)) for field in self.fields])

        return response
