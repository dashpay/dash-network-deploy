locals {
  instance_data = [
    for instance in concat(
      aws_instance.web,
      aws_instance.dashd_wallet,
      aws_instance.seed_node,
      aws_instance.miner,
      aws_instance.masternode_amd,
      aws_instance.masternode_arm,
      aws_instance.hp_masternode_amd,
      aws_instance.hp_masternode_arm,
      aws_instance.vpn,
      aws_instance.logs,
      aws_instance.mixer,
    ) : {
      Hostname     = instance.tags.Hostname
      InstanceId   = instance.id
      ImageId      = instance.ami
      InstanceType = instance.instance_type
    }
  ]
}

resource "aws_cloudwatch_metric_alarm" "cpu_monitoring" {

  count = var.monitoring_cpu_enabled ? length(local.instance_data) : 0

  alarm_name          = "${terraform.workspace}-${local.instance_data[count.index].Hostname}-cpu-monitoring"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 60

  alarm_actions = length(var.monitoring_sns_arn) > 1 ? [var.monitoring_sns_arn] : []

  dimensions = {
    InstanceId = local.instance_data[count.index].InstanceId
  }

  alarm_description = "This alarm monitors ec2 cpu utilization"
}

resource "aws_cloudwatch_metric_alarm" "memory_monitoring" {

  count = var.monitoring_mem_enabled ? length(local.instance_data) : 0

  alarm_name          = "${terraform.workspace}-${local.instance_data[count.index].Hostname}-memory-monitoring"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 85

  alarm_actions = length(var.monitoring_sns_arn) > 1 ? [var.monitoring_sns_arn] : []

  dimensions = {
    InstanceId = local.instance_data[count.index].InstanceId
  }

  alarm_description = "This alarm monitors ec2 memory utilization"
}

resource "aws_cloudwatch_metric_alarm" "swap_monitoring" {

  count = var.monitoring_swap_enabled ? length(local.instance_data) : 0

  alarm_name          = "${terraform.workspace}-${local.instance_data[count.index].Hostname}-swap-monitoring"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "swap_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 60

  alarm_actions = length(var.monitoring_sns_arn) > 1 ? [var.monitoring_sns_arn] : []

  dimensions = {
    InstanceId = local.instance_data[count.index].InstanceId
  }

  alarm_description = "This alarm monitors ec2 swap utilization"
}

resource "aws_cloudwatch_metric_alarm" "diskspace_monitoring" {

  count = var.monitoring_disk_enabled ? length(local.instance_data) : 0

  alarm_name          = "${terraform.workspace}-${local.instance_data[count.index].Hostname}-diskspace-monitoring"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 80

  alarm_actions = length(var.monitoring_sns_arn) > 1 ? [var.monitoring_sns_arn] : []

  dimensions = {
    ImageId      = local.instance_data[count.index].ImageId
    InstanceId   = local.instance_data[count.index].InstanceId
    InstanceType = local.instance_data[count.index].InstanceType
    device       = strcontains(local.instance_data[count.index].Hostname, "logs") ? "nvme1n1p1" : "nvme0n1p1"
    fstype       = "ext4"
    path         = strcontains(local.instance_data[count.index].Hostname, "logs") ? "/dash/elastic/data" : "/"
  }

  alarm_description = "This alarm monitors ec2 disk utilization"
}
