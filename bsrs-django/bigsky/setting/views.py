from rest_framework.permissions import IsAuthenticated

from setting.models import Setting
from setting.serializers import (
    SettingSerializer, SettingListSerializer, SettingUpdateSerializer,
    SettingDetailSerializer)
from utils.views import BaseModelViewSet


class SettingViewSet(BaseModelViewSet):

    model = Setting
    permission_classes = (IsAuthenticated,)
    queryset = Setting.objects.all()
    filter_fields = [f.name for f in model._meta.get_fields()]

    def get_serializer_class(self):
        """
        set the serializer based on the method
        """
        if self.action == 'list':
            return SettingListSerializer
        elif self.action == 'update':
            return SettingUpdateSerializer
        elif self.action == 'retrieve':
            return SettingDetailSerializer
        else:
            return SettingSerializer
