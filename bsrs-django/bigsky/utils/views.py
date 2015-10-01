from django.core.exceptions import ObjectDoesNotExist
# TODO: 
# Could reference this as a check that the field_args are
#   part of the Django ORM ``QUERY_TERMS``
from django.db.models.sql.constants import QUERY_TERMS

from rest_framework import viewsets, exceptions, status
from rest_framework.response import Response

from utils.mixins import DestroyModelMixin, OrderingQuerySetMixin


class BaseModelViewSet(DestroyModelMixin, OrderingQuerySetMixin, viewsets.ModelViewSet):
	
    queryset = None
    filter_fields = None

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
        """
        Allow filterable by 'IN' keyword.

        ``filter_fields``: A list of filterable fields that uses the 
        Django ORM sytax. Must be defined on the ModelViewSet that is 
        implementing this feature.
        """
        queryset = super(BaseModelViewSet, self).get_queryset()

        if self.filter_fields:
            kwargs = {}

            for param in self.request.query_params:
                if param.split("__")[0] in self.filter_fields:
                    if param.split("__")[-1] == "in":
                        value = self.request.query_params.get(param).split(',')
                    else:
                        value = self.request.query_params.get(param)

                    kwargs.update({param: value})

            queryset = queryset.filter(**kwargs)

        return queryset
