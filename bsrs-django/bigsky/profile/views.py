from rest_framework import permissions

from profile.models import Assignment
from profile.serializers import AssignmentCreateUpdateSerializer, AssignmentSerializer
from utils.mixins import EagerLoadQuerySetMixin, SearchMultiMixin
from utils.views import BaseModelViewSet


class AssignmentViewSet(EagerLoadQuerySetMixin, SearchMultiMixin, BaseModelViewSet):

    model = Assignment
    queryset = Assignment.objects.all()
    serializer_class = AssignmentCreateUpdateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.action in ('retrieve', 'list'):
            return AssignmentSerializer
        else:
            return AssignmentCreateUpdateSerializer
