
data "template_file" "web_hosts" {
  count = "${aws_instance.web.count}"
  template = "${file("${path.module}/inventory/hostname.tpl")}"
  vars {
    index = "${count.index + 1}"
    name  = "${element(aws_instance.web.*.tags.Hostname, count.index)}"
    public_ip = "${element(aws_instance.web.*.public_ip, count.index)}"
    private_ip = "${element(aws_instance.web.*.private_ip, count.index)}"
  }
}
data "template_file" "wallet_node_hosts" {
  count = "${aws_instance.dashd_wallet.count}"
  template = "${file("${path.module}/inventory/hostname.tpl")}"
  vars {
    index = "${count.index + 1}"
    name  = "${element(aws_instance.dashd_wallet.*.tags.Hostname, count.index)}"
    public_ip = "${element(aws_instance.dashd_wallet.*.public_ip, count.index)}"
    private_ip = "${element(aws_instance.dashd_wallet.*.private_ip, count.index)}"
  }
}
data "template_file" "full_node_hosts" {
  count = "${aws_instance.dashd_full_node.count}"
  template = "${file("${path.module}/inventory/hostname.tpl")}"
  vars {
    index = "${count.index + 1}"
    name  = "${element(aws_instance.dashd_full_node.*.tags.Hostname, count.index)}"
    public_ip = "${element(aws_instance.dashd_full_node.*.public_ip, count.index)}"
    private_ip = "${element(aws_instance.dashd_full_node.*.private_ip, count.index)}"
  }
}
data "template_file" "miner_hosts" {
  count = "${aws_instance.miner.count}"
  template = "${file("${path.module}/inventory/hostname.tpl")}"
  vars {
    index = "${count.index + 1}"
    name  = "${element(aws_instance.miner.*.tags.Hostname, count.index)}"
    public_ip = "${element(aws_instance.miner.*.public_ip, count.index)}"
    private_ip = "${element(aws_instance.miner.*.private_ip, count.index)}"
  }
}
data "template_file" "masternode_hosts" {
  count = "${aws_instance.masternode.count}"
  template = "${file("${path.module}/inventory/hostname.tpl")}"
  vars {
    index = "${count.index + 1}"
    name  = "${element(aws_instance.masternode.*.tags.Hostname, count.index)}"
    public_ip = "${element(aws_instance.masternode.*.public_ip, count.index)}"
    private_ip = "${element(aws_instance.masternode.*.private_ip, count.index)}"
  }
}


data "template_file" "ansible_inventory" {
  template = "${file("${path.module}/inventory/ansible_inventory.tpl")}"
  vars {
    all_hosts   = "${join("\n",concat(
      data.template_file.web_hosts.*.rendered,
      data.template_file.wallet_node_hosts.*.rendered,
      data.template_file.full_node_hosts.*.rendered,
      data.template_file.miner_hosts.*.rendered,
      data.template_file.masternode_hosts.*.rendered))}"
    web_hosts = "${join("\n", concat(aws_instance.web.*.tags.Hostname))}"
    wallet_node_hosts = "${join("\n", concat(aws_instance.dashd_wallet.*.tags.Hostname))}"
    full_node_hosts = "${join("\n", concat(aws_instance.dashd_full_node.*.tags.Hostname))}"
    miner_hosts = "${join("\n", concat(aws_instance.miner.*.tags.Hostname))}"
    masternode_hosts = "${join("\n", concat(aws_instance.masternode.*.tags.Hostname))}"
  }
}

output "ansible_inventory" {
  value = "${data.template_file.ansible_inventory.rendered}"
}
