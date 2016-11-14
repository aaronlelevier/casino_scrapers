from generic.models import SavedSearch, Attachment
from utils.serializers import BaseCreateSerializer


class SavedSearchSerializer(BaseCreateSerializer):

    class Meta:
        model = SavedSearch
        fields = ('id', 'name', 'endpoint_name', 'endpoint_uri', 'created')


class AttachmentSerializer(BaseCreateSerializer):

    class Meta:
        model = Attachment
        fields = ('id', 'filename', 'file', 'image_full', 'image_medium', 'image_thumbnail')

class AttachmentThumbnailSerializer(BaseCreateSerializer):

    class Meta:
        model = Attachment
        fields = ('id', 'filename', 'file', 'image_thumbnail')
