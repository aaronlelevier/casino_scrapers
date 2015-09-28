from django.core.exceptions import ObjectDoesNotExist
# TODO: 
# Could reference this as a check that the field_args are
#   part of the Django ORM ``QUERY_TERMS``
from django.db.models.sql.constants import QUERY_TERMS

from rest_framework import viewsets, exceptions, status
from rest_framework.response import Response

from util.mixins import DestroyModelMixin, OrderingQuerySetMixin


class BaseModelViewSet(DestroyModelMixin, OrderingQuerySetMixin, viewsets.ModelViewSet):
	
    queryset = None

    def get_model(self):
        return self.model

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # custom: start
        try:
            _id = serializer.data['id']
            self.queryset.get(id=_id)
        except (KeyError, ObjectDoesNotExist):
            pass
        else:
            raise exceptions.ValidationError("ID: {} already exists.".format(_id))
        # custom: end
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        "Allow filterable by 'IN' keyword."
        queryset = super(BaseModelViewSet, self).get_queryset()

        for param in self.request.query_params:
            if param.split("__")[0] in self.filter_fields:
                print 'param'
                value = self.request.query_params.get(param).split(',')
                value = value if len(value) > 1 else value[0]
                print param
                print value
                # field, lookup = param.split("__")
                print queryset
                queryset = queryset.filter(**{param: value})
                print queryset

        return queryset