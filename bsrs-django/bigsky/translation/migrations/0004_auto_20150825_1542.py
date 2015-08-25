# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0003_auto_20150825_1524'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='locale',
            options={},
        ),
        migrations.RenameField(
            model_name='locale',
            old_name='language',
            new_name='locale',
        ),
        migrations.AddField(
            model_name='locale',
            name='default',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='locale',
            name='name',
            field=models.CharField(default=1, unique=True, max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='locale',
            name='rtl',
            field=models.BooleanField(default=False),
        ),
    ]
