from django.core.exceptions import ObjectDoesNotExist

from rest_framework import viewsets, exceptions, status
from rest_framework.response import Response

from util.mixins import DestroyModelMixin


class BaseModelViewSet(DestroyModelMixin, viewsets.ModelViewSet):
	
    queryset = None

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

