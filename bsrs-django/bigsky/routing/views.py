from rest_framework import permissions

from routing.models import Assignment
from routing import serializers as rs
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet


class AssignmentViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):

    model = Assignment
    queryset = Assignment.objects.all()
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return rs.AssignmentDetailSerializer
        if self.action == 'list':
            return rs.AssignmentListSerializer
        else:
            return rs.AssignmentCreateUpdateSerializer

    def create(self, request, *args, **kwargs):
        """
        Attach tenant based upon User for validating uniqueness of
        description and order by Tenant.
        """
        request.data['tenant'] = request.user.role.tenant.id
        return super(AssignmentViewSet, self).create(request, *args, **kwargs)