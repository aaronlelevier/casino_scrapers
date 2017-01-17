from django.http import Http404
from django.utils import six
from django.utils.translation import ugettext_lazy as _

from rest_framework import exceptions, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response


class CrudPermissions(permissions.BasePermission):

    PERM_MAP = {
        'GET': 'view',
        'POST': 'add',
        'PUT': 'change',
        'DELETE': 'delete',
        'OPTIONS': '',
        'PATCH': '',
    }

    def has_permission(self, request, view):
        perm = self.PERM_MAP[request.method]
        model = self._get_model_name(view.model)
        return "{}_{}".format(perm, model) in request.user.permissions

    def _get_model_name(self, model):
        return model.__name__.lower()


def exception_handler(exc, context):
    """
    Custom override the default `rest_framework.views.exception_handler`
    So NotFound and PermissionDenied both return a 404 response.
    """
    if isinstance(exc, (Http404, PermissionDenied)):
        msg = _('Not found.')
        data = {'detail': six.text_type(msg)}
        return Response(data, status=status.HTTP_404_NOT_FOUND)

    elif isinstance(exc, exceptions.APIException):
        headers = {}
        if getattr(exc, 'auth_header', None):
            headers['WWW-Authenticate'] = exc.auth_header
        if getattr(exc, 'wait', None):
            headers['Retry-After'] = '%d' % exc.wait

        if isinstance(exc.detail, (list, dict)):
            data = exc.detail
        else:
            data = {'detail': exc.detail}

        return Response(data, status=exc.status_code, headers=headers)

    # Note: Unhandled exceptions will raise a 500 error.
    return None
