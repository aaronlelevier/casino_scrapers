# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
        ('category', '0001_initial'),
        ('third_party', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='thirdparty',
            name='categories',
            field=models.ManyToManyField(related_name='categories', to='category.Category', blank=True),
        ),
        migrations.AddField(
            model_name='thirdparty',
            name='currency',
            field=models.ForeignKey(to='accounting.Currency', blank=True, null=True),
        ),
    ]
