from rest_framework import permissions

from assignment.models import Profile
from assignment.serializers import ProfileListSerializer
from utils.views import BaseModelViewSet


class ProfileViewSet(BaseModelViewSet):

    model = Profile
    queryset = Profile.objects.all()
    serializer_class = ProfileListSerializer
    permission_classes = (permissions.IsAuthenticated,)
