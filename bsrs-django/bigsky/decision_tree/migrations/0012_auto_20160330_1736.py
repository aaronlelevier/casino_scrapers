# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-03-31 00:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decision_tree', '0011_treefield_order'),
    ]

    operations = [
        migrations.AlterField(
            model_name='treefield',
            name='type',
            field=models.CharField(choices=[('admin.dtd.label.field.text', 'admin.dtd.label.field.text'), ('admin.dtd.label.field.textarea', 'admin.dtd.label.field.textarea'), ('admin.dtd.label.field.select', 'admin.dtd.label.field.select'), ('admin.dtd.label.field.checkbox', 'admin.dtd.label.field.checkbox'), ('admin.dtd.label.field.file', 'admin.dtd.label.field.file'), ('admin.dtd.label.field.asset_select', 'admin.dtd.label.field.asset_select'), ('admin.dtd.label.field.check_in', 'admin.dtd.label.field.check_in'), ('admin.dtd.label.field.check_out', 'admin.dtd.label.field.check_out')], default='admin.dtd.label.field.text', max_length=100),
        ),
    ]
