# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='workorder',
            options={},
        ),
        migrations.AlterModelOptions(
            name='workorderstatus',
            options={},
        ),
    ]
