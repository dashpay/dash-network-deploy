resource "aws_iam_role" "monitoring" {
  name = "${terraform.workspace}-monitoring"

  assume_role_policy = <<-EOT
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Principal": {
            "Service": "ec2.amazonaws.com"
          },
          "Effect": "Allow",
          "Sid": ""
        }
      ]
    }
    EOT

}

locals {
  managed_roles = [
    "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  ]
}

resource "aws_iam_role_policy_attachment" "monitoring-role-attach" {
  role = aws_iam_role.monitoring.name

  count      = length(local.managed_roles)
  policy_arn = local.managed_roles[count.index]
}

resource "aws_iam_instance_profile" "monitoring" {
  name = "${terraform.workspace}-monitoring"
  role = aws_iam_role.monitoring.name
}
