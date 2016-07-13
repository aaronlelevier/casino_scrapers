from rest_framework import permissions

from routing.models import Assignment
from routing import serializers as rs
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet


class AssignmentViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):

    model = Assignment
    queryset = Assignment.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    # TODO: eager load for 'retrieve'
    eager_load_actions = ['list']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return rs.AssignmentDetailSerializer
        if self.action == 'list':
            return rs.AssignmentListSerializer
        else:
            return rs.AssignmentCreateUpdateSerializer
