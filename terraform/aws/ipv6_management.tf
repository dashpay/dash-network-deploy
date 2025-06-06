# This file manages IPv6 address assignment without forcing instance replacement

# Get all network interfaces for our instances
data "aws_network_interface" "all_instances" {
  for_each = var.enable_ipv6 ? merge(
    { for i in range(var.web_count) : "web-${i}" => aws_instance.web[i].primary_network_interface_id },
    { for i in range(var.wallet_count) : "wallet-${i}" => aws_instance.dashd_wallet[i].primary_network_interface_id },
    { for i in range(var.seed_count) : "seed-${i}" => aws_instance.seed_node[i].primary_network_interface_id },
    { for i in range(var.miner_count) : "miner-${i}" => aws_instance.miner[i].primary_network_interface_id },
    { for i in range(var.masternode_amd_count) : "masternode-amd-${i}" => aws_instance.masternode_amd[i].primary_network_interface_id },
    { for i in range(var.masternode_arm_count) : "masternode-arm-${i}" => aws_instance.masternode_arm[i].primary_network_interface_id },
    { for i in range(var.hp_masternode_amd_count) : "hp-masternode-amd-${i}" => aws_instance.hp_masternode_amd[i].primary_network_interface_id },
    { for i in range(var.hp_masternode_arm_count) : "hp-masternode-arm-${i}" => aws_instance.hp_masternode_arm[i].primary_network_interface_id },
    { for i in range(var.mixer_count) : "mixer-${i}" => aws_instance.mixer[i].primary_network_interface_id },
    { for i in range(var.logs_count) : "logs-${i}" => aws_instance.logs[i].primary_network_interface_id },
    { for i in range(var.load_test_count) : "load-test-${i}" => aws_instance.load_test[i].primary_network_interface_id },
    { for i in range(var.metrics_count) : "metrics-${i}" => aws_instance.metrics[i].primary_network_interface_id },
    var.vpn_enabled ? { "vpn-0" = aws_instance.vpn[0].primary_network_interface_id } : {}
  ) : {}

  id = each.value
}

# Assign IPv6 addresses using null_resource and AWS CLI
resource "null_resource" "assign_ipv6" {
  for_each = var.enable_ipv6 ? data.aws_network_interface.all_instances : {}

  triggers = {
    network_interface_id = each.value.id
    enable_ipv6         = var.enable_ipv6
  }

  provisioner "local-exec" {
    command = <<-EOT
      # Check if the network interface already has an IPv6 address
      existing_ipv6=$(aws ec2 describe-network-interfaces \
        --network-interface-ids ${each.value.id} \
        --query 'NetworkInterfaces[0].Ipv6Addresses' \
        --output text 2>/dev/null || echo "None")
      
      if [ "$existing_ipv6" = "None" ] || [ -z "$existing_ipv6" ]; then
        echo "Assigning IPv6 address to ${each.key} (${each.value.id})"
        aws ec2 assign-ipv6-addresses \
          --network-interface-id ${each.value.id} \
          --ipv6-address-count 1 \
          2>/dev/null || echo "Failed to assign IPv6 to ${each.key}"
      else
        echo "IPv6 address already assigned to ${each.key}"
      fi
    EOT
  }

  # Remove IPv6 when destroyed
  provisioner "local-exec" {
    when    = destroy
    command = <<-EOT
      # Get all IPv6 addresses for this interface
      ipv6_addresses=$(aws ec2 describe-network-interfaces \
        --network-interface-ids ${self.triggers.network_interface_id} \
        --query 'NetworkInterfaces[0].Ipv6Addresses[*].Ipv6Address' \
        --output text 2>/dev/null || echo "")
      
      if [ ! -z "$ipv6_addresses" ]; then
        echo "Removing IPv6 addresses from ${self.triggers.network_interface_id}: $ipv6_addresses"
        aws ec2 unassign-ipv6-addresses \
          --network-interface-id ${self.triggers.network_interface_id} \
          --ipv6-addresses $ipv6_addresses \
          2>/dev/null || echo "Failed to remove IPv6 addresses"
      fi
    EOT
  }
}

# Output IPv6 addresses for reference
output "instance_ipv6_addresses" {
  value = var.enable_ipv6 ? {
    for k, v in data.aws_network_interface.all_instances : 
    k => length(v.ipv6_addresses) > 0 ? v.ipv6_addresses[0] : "pending"
  } : {}
  description = "IPv6 addresses assigned to instances"
}
