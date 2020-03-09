# 0.1.0 (2020-03-09)

### Bug Fixes

* always restart docker services ([91fe40b](https://github.com/dashevo/dash-network-deploy/commit/91fe40b55967a6658b464e3fada258f1d49a7abc))
* do not set `bind` with `listen=0` in `dashd.conf` ([07e3c3c](https://github.com/dashevo/dash-network-deploy/commit/07e3c3c070f13fa00c7b5c59d237253be639da21))
* prevent to update dependencies with major version `0` to minor versions ([29cb9ba](https://github.com/dashevo/dash-network-deploy/commit/29cb9ba2bcb448ce28d7edfc960b7770921d874a))
* skip 3rd party connected masternodes in smoke tests ([f938592](https://github.com/dashevo/dash-network-deploy/commit/f93859263cbdbfc91b297e5cfd3902f31ec2c40d))

### Features

* add DAPI gRPC Web test case ([34aeca0](https://github.com/dashevo/dash-network-deploy/commit/34aeca04069e30e69af5000c40f451dffa20a968))
* update DAPI smoke tests to DAPI v0.10 ([47488bb](https://github.com/dashevo/dash-network-deploy/commit/47488bbcc269959090f061218321d04605639060))
* remove data contract restriction option ([6356bc0](https://github.com/dashevo/dash-network-deploy/commit/6356bc0081f1df08619a68ec4c4c359b0ed16cac))
* introduce Envoy proxy for gRPC Web ([e269cd2](https://github.com/dashevo/dash-network-deploy/commit/e269cd2b64ee5981d400274a087ec9a450a45f43))
* add swap role and enable for all hosts ([b9ee37e](https://github.com/dashevo/dash-network-deploy/commit/b9ee37e698e877accc898eb86df3a74bb83d1eaf)) 
