# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0011_auto_20150825_1727'),
    ]

    operations = [
        migrations.AddField(
            model_name='locale',
            name='native_name',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='locale',
            name='presentation_name',
            field=models.CharField(max_length=50, null=True, blank=True),
        ),
    ]
