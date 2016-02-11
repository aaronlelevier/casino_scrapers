from generic.models import SavedSearch, Attachment, Setting
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


class SettingListSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        fields = ('id', 'name',)


class SettingCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Setting
        validators = [SettingsValidator(model)]
        fields = ('id', 'name',)


class SettingSerializer(SettingSerializerMixin, BaseCreateSerializer):

    class Meta:
        model = Setting
        validators = [SettingsValidator(model)]
        fields = ('id', 'name', 'settings',)
