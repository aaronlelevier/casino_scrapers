from rest_framework import status
from rest_framework.response import Response

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