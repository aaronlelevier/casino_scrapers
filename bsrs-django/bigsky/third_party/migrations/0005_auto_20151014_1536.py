# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('third_party', '0004_auto_20151014_1414'),
    ]

    operations = [
        migrations.AlterField(
            model_name='thirdparty',
            name='categories',
            field=models.ManyToManyField(blank=True, to='category.Category', related_name='third_parties'),
        ),
        migrations.AlterField(
            model_name='thirdparty',
            name='number',
            field=models.CharField(blank=True, null=True, max_length=50, unique=True),
        ),
    ]
