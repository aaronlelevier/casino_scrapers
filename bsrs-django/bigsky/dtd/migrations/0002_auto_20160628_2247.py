# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-28 22:47
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('ticket', '0001_initial'),
        ('dtd', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='treelink',
            name='priority',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='ticket.TicketPriority'),
        ),
        migrations.AddField(
            model_name='treelink',
            name='status',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='ticket.TicketStatus'),
        ),
        migrations.AddField(
            model_name='treefield',
            name='tree_data',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='fields', to='dtd.TreeData'),
        ),
    ]