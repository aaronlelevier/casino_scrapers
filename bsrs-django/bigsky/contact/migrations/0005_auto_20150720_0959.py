# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0004_auto_20150717_1142'),
    ]

    operations = [
        migrations.AlterField(
            model_name='phonenumber',
            name='number',
            field=models.CharField(max_length=32),
        ),
    ]
