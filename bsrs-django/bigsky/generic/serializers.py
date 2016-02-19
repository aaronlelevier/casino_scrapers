import copy

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

    def to_representation(self, instance):
        init_data = super(SettingSerializer, self).to_representation(instance)

        data = copy.copy(init_data)
        detail_api_keys = self.Meta.model.detail_api_keys()

        for key, init_setting in init_data['settings'].items():
            setting = copy.copy(init_setting)

            for k, v in setting.items():
                if k not in detail_api_keys:
                    data['settings'][key].pop(k, None)

        return data
