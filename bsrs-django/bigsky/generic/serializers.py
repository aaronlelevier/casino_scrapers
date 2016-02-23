import copy

from generic.models import SavedSearch, Attachment
from utils.serializers import BaseCreateSerializer, SettingSerializerMixin
from utils.validators import SettingsValidator


class SavedSearchSerializer(BaseCreateSerializer):

    class Meta:
        model = SavedSearch
        fields = ('id', 'name', 'endpoint_name', 'endpoint_uri')


class AttachmentSerializer(BaseCreateSerializer):

    class Meta:
        model = Attachment
        fields = ('id', 'filename', 'file',)
