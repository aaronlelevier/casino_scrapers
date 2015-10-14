# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('third_party', '0002_auto_20151013_0942'),
    ]

    operations = [
        migrations.AlterField(
            model_name='thirdpartystatus',
            name='description',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
