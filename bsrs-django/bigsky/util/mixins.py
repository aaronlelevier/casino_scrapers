from django.db.models.functions import Lower

from rest_framework import status
from rest_framework.response import Response


### VIEWS

class DestroyModelMixin(object):
    """
    Destroy a model instance, extended to handle `override` kwarg.
    """
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        override = request.data.get('override', None)
        self.perform_destroy(instance, override)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance, override):
        instance.delete(override)


### QUERYSETS

class OrderyingQuerysetMixin(object):
    """Return a case-insensitive ordered queryset."""
    
    def get_queryset(self):
        queryset = self.queryset
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            if ordering.startswith('-'):
                queryset = queryset.order_by(Lower(ordering[1:])).reverse()
            else:
                queryset = queryset.order_by(Lower(ordering))
        return queryset