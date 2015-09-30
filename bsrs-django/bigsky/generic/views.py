import csv

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

class ExportData(View):
    """
    Parse the requested CSV report requested from the Person.

    Requires the POST params:

    :app_name:
    :model_name:
    :query_params: filters, sorting, etc.  TBD: Django ORM, or need to convert from Ember ??
    :fields: Person defined fields to output

    # TODO: would the Person like to name the CSV report that they are outputting?
    #   or we parse some kind of human readable file output name w/ a datetime stamp?
    """

    def dispatch(self, request, *args, **kwargs):
        if request.method.lower() != u'post':
            raise PermissionDenied("{} not allowed".format(request.method.lower()))
        return super(ExportData, self).dispatch(request, *args, **kwargs)

    def get_model_and_fields(self, request):
        try:
            app_name = request.POST.pop('app_name')
            model_name = request.POST.pop('model_name')
            fields = request.POST.pop('fields')
            query_params = request.POST.get('query_params')
        except KeyError as e:
            raise ValidationError(str(e))
        return (app_name, model_name, fields, query_params)

    def post(self, request, *args, **kwargs):
        (app_name, model_name, fields, query_params) = self.get_model_and_fields(request)

        model = get_model(app_name, model_name)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="{name}.csv"'.format(
            name=model._meta.verbose_name_plural)

        # Init CSV
        writer = csv.writer(response)
        # Header
        writer.writerow(fields)
        
        # Parse ``query_params``
        kwargs = {}

        for param in query_params:
            if param.split("__")[-1] == "in":
                value = query_params.get(param).split(',')
            else:
                value = query_params.get(param)

                kwargs.update({param: value})

        queryset = model.objects.filter(**kwargs)

        # Data
        for obj in queryset:
            writer.writerow([str(getattr(obj, field)) for field in fields])

        return response
    else:
        # This view can only be POSTed to.
        raise Http404
