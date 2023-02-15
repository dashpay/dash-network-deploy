locals {
  instance_ids = concat(
    aws_instance.web.*.id,
    aws_instance.dashd_wallet.*.id,
    aws_instance.seed_node.*.id,
    aws_instance.miner.*.id,
    aws_instance.masternode_amd.*.id,
    aws_instance.masternode_arm.*.id,
    aws_instance.vpn.*.id,
  )
  instance_hostnames = concat(
    aws_instance.web.*.tags.Hostname,
    aws_instance.dashd_wallet.*.tags.Hostname,
    aws_instance.seed_node.*.tags.Hostname,
    aws_instance.miner.*.tags.Hostname,
    aws_instance.masternode_amd.*.tags.Hostname,
    aws_instance.masternode_arm.*.tags.Hostname,
    aws_instance.vpn.*.tags.Hostname,
  )
}

resource "aws_cloudwatch_metric_alarm" "cpu_monitoring" {

  count = var.monitoring_enabled ? length(local.instance_ids) : 0

  alarm_name          = "${terraform.workspace}-${local.instance_hostnames[count.index]}-cpu-monitoring"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "360"
  statistic           = "Average"
  threshold           = "60"

  insufficient_data_actions = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []
  alarm_actions             = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []
  ok_actions                = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []

  dimensions = {
    InstanceId = local.instance_ids[count.index]
  }

  alarm_description = "This metric monitors ec2 cpu utilization"
}

resource "aws_cloudwatch_metric_alarm" "memory_monitoring" {

  count = var.monitoring_enabled ? length(local.instance_ids) : 0

  alarm_name          = "${terraform.workspace}-${local.instance_hostnames[count.index]}-memory-monitoring"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "System/Linux"
  period              = "360"
  statistic           = "Average"
  threshold           = "85"

  insufficient_data_actions = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []
  alarm_actions             = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []
  ok_actions                = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []

  dimensions = {
    InstanceId = local.instance_ids[count.index]
  }

  alarm_description = "This metric monitors ec2 memory utilization"
}

resource "aws_cloudwatch_metric_alarm" "swap_monitoring" {

  count = var.monitoring_enabled ? length(local.instance_ids) : 0

  alarm_name          = "${terraform.workspace}-${local.instance_hostnames[count.index]}-swap-monitoring"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "SwapUtilization"
  namespace           = "System/Linux"
  period              = "360"
  statistic           = "Average"
  threshold           = "15"

  insufficient_data_actions = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []
  alarm_actions             = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []
  ok_actions                = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []

  dimensions = {
    InstanceId = local.instance_ids[count.index]
  }

  alarm_description = "This metric monitors ec2 swap utilization"
}

resource "aws_cloudwatch_metric_alarm" "diskspace_monitoring" {

  count = var.monitoring_enabled ? length(local.instance_ids) : 0

  alarm_name          = "${terraform.workspace}-${local.instance_hostnames[count.index]}-diskspace-monitoring"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "DiskSpaceUtilization"
  namespace           = "System/Linux"
  period              = "360"
  statistic           = "Average"
  threshold           = "80"

  insufficient_data_actions = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []
  alarm_actions             = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []
  ok_actions                = length(var.montitoring_sns_arn) > 1 ? [var.montitoring_sns_arn] : []

  dimensions = {
    InstanceId = local.instance_ids[count.index]
    MountPath  = "/"
    Filesystem = "/dev/nvme0n1p1"
  }

  alarm_description = "This metric monitors ec2 disk utilization"
}
