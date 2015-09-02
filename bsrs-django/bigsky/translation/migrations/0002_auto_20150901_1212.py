# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locale',
            name='locale',
            field=models.SlugField(help_text=b'Example values: en, en-us, en-x-sephora', unique=True),
        ),
    ]
