import csv

from django.http import HttpResponse, Http404
from django.db.models.loading import get_model

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


def export_static(request):
    # Create the HttpResponse object with the appropriate CSV header.
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="somefilename.csv"'

    writer = csv.writer(response)
    writer.writerow(['First row', 'Foo', 'Bar', 'Baz'])
    writer.writerow(['Second row', 'A', 'B', 'C', '"Testing"', "Here's a quote"])

    return response


def export_data(request):
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
    if request.method == "POST":
        try:
            app_name = request.POST.get('app_name')
            model_name = request.POST.get('model_name')
            query_params = request.POST.get('query_params')
            fields = request.POST.get('fields')
        except KeyError as e:
            raise ValidationError(str(e))

        model = get_model(app_name, model_name)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="{name}.csv"'.format(
            name=model._meta.verbose_name_plural)

        # Init CSV
        writer = csv.writer(response)
        # Header
        writer.writerow(fields)
        # Data
        for obj in model.objects.filter(**query_params): # TODO: need to iron out how to do ordering here
                                                         #       and what format ``query_params`` are in ??
            writer.writerow([str(getattr(obj, field)) for field in fields])

        return response
    else:
        # This view can only be POSTed to.
        raise Http404
