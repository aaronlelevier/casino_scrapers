# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields.hstore
import translation.models


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0007_auto_20150825_1617'),
    ]

    operations = [
        migrations.AddField(
            model_name='translation',
            name='context',
            field=django.contrib.postgres.fields.hstore.HStoreField(default={'foo': 'bar'}),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='translation',
            name='csv',
            field=models.FileField(null=True, upload_to=translation.models.translation_file, blank=True),
        ),
    ]
