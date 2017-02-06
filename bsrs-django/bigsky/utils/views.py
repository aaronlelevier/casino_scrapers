from rest_framework import viewsets

from utils.mixins import (CheckIdCreateMixin, DestroyModelMixin, OrderingQuerySetMixin,
    FilterRelatedMixin)


class BaseModelViewSet(CheckIdCreateMixin, DestroyModelMixin, FilterRelatedMixin,
    OrderingQuerySetMixin, viewsets.ModelViewSet):
    pass


def paginate_queryset_as_response(serializer_class=None):
    """
    Use to decorate a method that returns a queryset. That queryset will
    then be returned as a a paginated DRF response.

    :param serializer_class: Serializer class to use with response.
    """
    def _outer_wrapper(wrapped_function):
        def _wrapper(self, *args, **kwargs):

            queryset = wrapped_function(self, *args, **kwargs)

            queryset = self.paginate_queryset(queryset)

            if serializer_class:
                serializer = serializer_class(queryset, many=True)
            else:
                serializer = self.get_serializer(queryset, many=True)

            return self.get_paginated_response(serializer.data)
        return _wrapper
    return _outer_wrapper
