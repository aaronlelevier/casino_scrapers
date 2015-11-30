# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import finite_state.models
import django_fsm


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='BlogPost',
            fields=[
                ('id', models.AutoField(auto_created=True, verbose_name='ID', serialize=False, primary_key=True)),
            ],
        ),
        migrations.CreateModel(
            name='DbState',
            fields=[
                ('id', finite_state.models.FSMUuidField(default='def11673-d4ab-41a6-a37f-0c6846b96006', editable=False, serialize=False, primary_key=True)),
                ('label', models.CharField(max_length=255)),
            ],
        ),
        migrations.AddField(
            model_name='blogpost',
            name='state',
            field=django_fsm.FSMKeyField(to='finite_state.DbState', default='def11673-d4ab-41a6-a37f-0c6846b96006'),
        ),
    ]
