# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('third_party', '0002_auto_20151006_1024'),
    ]

    operations = [
        migrations.AddField(
            model_name='thirdparty',
            name='name',
            field=models.CharField(max_length=100, default='abc123', unique=True),
            preserve_default=False,
        ),
    ]
