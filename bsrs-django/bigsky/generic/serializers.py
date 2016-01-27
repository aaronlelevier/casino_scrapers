from generic.models import SavedSearch, Attachment, Setting
from generic.settings import DEFAULT_GENERAL_SETTINGS
from utils.serializers import BaseCreateSerializer, SettingSerializerMixin


class SavedSearchSerializer(BaseCreateSerializer):

    class Meta:
        model = SavedSearch
        fields = ('id', 'name', 'endpoint_name', 'endpoint_uri')


class AttachmentSerializer(BaseCreateSerializer):

    class Meta:
        model = Attachment
        fields = ('id', 'filename', 'file',)


class SettingListSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        fields = ('id', 'name',)


class SettingSerializer(SettingSerializerMixin, BaseCreateSerializer):

    class Meta:
        model = Setting
        fields = ('id', 'name', 'settings',)

    @staticmethod
    def _get_settings_file(name):
        if name == 'general':
            return DEFAULT_GENERAL_SETTINGS
        else:
            return {}
