# 0.11.0 (2020-03-09)

### Bug Fixes

* remove temporary Tendermint containers (#132) ([a7b6c96](https://github.com/dashevo/dash-network-deploy/commit/a7b6c96badf5f68b2c0dfd3eb0ef0daadc655271))
* adjust smoke test timeouts (#131) ([5a5f0af](https://github.com/dashevo/dash-network-deploy/commit/5a5f0af325541e5dc6071d7772a7dd7f46d8f23c), [415868d](https://github.com/dashevo/dash-network-deploy/commit/415868df492dbea91a01e210634d5ff9376baaa8))
* always restart docker services ([91fe40b](https://github.com/dashevo/dash-network-deploy/commit/91fe40b55967a6658b464e3fada258f1d49a7abc))
* do not set `bind` with `listen=0` in `dashd.conf` ([07e3c3c](https://github.com/dashevo/dash-network-deploy/commit/07e3c3c070f13fa00c7b5c59d237253be639da21))
* prevent to update dependencies with major version `0` to minor versions ([29cb9ba](https://github.com/dashevo/dash-network-deploy/commit/29cb9ba2bcb448ce28d7edfc960b7770921d874a))
* skip 3rd party connected masternodes in smoke tests ([f938592](https://github.com/dashevo/dash-network-deploy/commit/f93859263cbdbfc91b297e5cfd3902f31ec2c40d))
* wrong container name after service restart ([dc473dc](https://github.com/dashevo/dash-network-deploy/commit/dc473dc40743ac7b2b9c0f8c4b33ff7f4f89b2f6))
* add generate command to Docker image entrypoint ([8ec1e1f](https://github.com/dashevo/dash-network-deploy/commit/8ec1e1fa7e65f94c70827e83e823f1cc8d9bf8f5))
* disable debug logging for Dash Core ([2c4433d](https://github.com/dashevo/dash-network-deploy/commit/2c4433d76697a74097095f3dfcd7e06c5458a4c3))
* handle DAPI Client "not found" response ([eefb263](https://github.com/dashevo/dash-network-deploy/commit/eefb263bce272ef96aef5f3ade65d74adef26e4e))
* add ssh to Docker image dependencies ([4010415](https://github.com/dashevo/dash-network-deploy/commit/4010415abafe735cde742b050b93cf8624f59552))

### Features

* add DAPI gRPC Web test case ([34aeca0](https://github.com/dashevo/dash-network-deploy/commit/34aeca04069e30e69af5000c40f451dffa20a968))
* update DAPI smoke tests to DAPI v0.10 ([47488bb](https://github.com/dashevo/dash-network-deploy/commit/47488bbcc269959090f061218321d04605639060))
* remove data contract restriction option ([6356bc0](https://github.com/dashevo/dash-network-deploy/commit/6356bc0081f1df08619a68ec4c4c359b0ed16cac))
* introduce Envoy proxy for gRPC Web ([e269cd2](https://github.com/dashevo/dash-network-deploy/commit/e269cd2b64ee5981d400274a087ec9a450a45f43))
* add swap role and enable for all hosts ([b9ee37e](https://github.com/dashevo/dash-network-deploy/commit/b9ee37e698e877accc898eb86df3a74bb83d1eaf)) 
* upgrade Terraform to v0.12.23 (#130) ([e0f2c3f](https://github.com/dashevo/dash-network-deploy/commit/e0f2c3f8ade850c9c2795a09b74192c9d86afb1c))
* upgrade AWS instances to Ubuntu 18 LTS (#128) ([6932977](https://github.com/dashevo/dash-network-deploy/commit/6932977c338d40967eca47115fe78b9e82f63e7b))
* add versions for Docker image ([1356783](https://github.com/dashevo/dash-network-deploy/commit/13567835cc5ebc730ae107d263cd85dd349b73cb))
