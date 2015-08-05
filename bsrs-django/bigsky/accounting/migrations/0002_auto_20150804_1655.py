# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='currency',
            name='code',
            field=models.CharField(help_text=b"i.e. 'usd'", max_length=3),
        ),
        migrations.AlterField(
            model_name='currency',
            name='name',
            field=models.CharField(help_text=b'US Dollar', max_length=50),
        ),
    ]
