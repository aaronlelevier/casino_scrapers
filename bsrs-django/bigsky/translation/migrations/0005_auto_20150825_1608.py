# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0004_auto_20150825_1542'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='locale',
            options={'ordering': ('id',)},
        ),
        migrations.AlterField(
            model_name='locale',
            name='default',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='locale',
            name='name',
            field=models.CharField(help_text=b"Human readable name in forms. i.e. 'English'", unique=True, max_length=50),
        ),
    ]
