# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('generic', '0004_auto_20150929_0726'),
    ]

    operations = [
        migrations.AlterField(
            model_name='savedsearch',
            name='endpoint_uri',
            field=models.CharField(help_text=b'API Endpoint that this search is saved for. With all keywords ordering, and filters, etc...', max_length=2048),
        ),
    ]
