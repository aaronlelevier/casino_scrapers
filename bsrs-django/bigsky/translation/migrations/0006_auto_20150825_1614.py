# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0005_auto_20150825_1608'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locale',
            name='locale',
            field=models.SlugField(help_text=b'Example values: en, en-US, en-x-Sephora', unique=True),
        ),
        migrations.AlterField(
            model_name='locale',
            name='name',
            field=models.CharField(help_text=b"Human readable name in forms. i.e. 'English'", max_length=50),
        ),
    ]
