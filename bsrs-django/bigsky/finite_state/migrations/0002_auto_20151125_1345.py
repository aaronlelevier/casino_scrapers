# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django_fsm
import finite_state.models


class Migration(migrations.Migration):

    dependencies = [
        ('finite_state', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkRequestStatus',
            fields=[
                ('id', finite_state.models.FSMUuidField(default='def11673-d4ab-41a6-a37f-0c6846b96006', editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=254)),
            ],
        ),
        migrations.RenameModel(
            old_name='BlogPost',
            new_name='WorkRequest',
        ),
        migrations.DeleteModel(
            name='DbState',
        ),
        migrations.RemoveField(
            model_name='workrequest',
            name='state',
        ),
        migrations.AddField(
            model_name='workrequest',
            name='status',
            field=django_fsm.FSMKeyField(default='def11673-d4ab-41a6-a37f-0c6846b96006', to='finite_state.WorkRequestStatus'),
        ),
    ]
