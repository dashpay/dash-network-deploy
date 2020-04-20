## [0.12.1](https://github.com/dashpay/dash-network-deploy/compare/v0.12.0...v0.12.1) (2020-04-20)


### Bug Fixes

* wrong docker credential envs in deploy script ([#151](https://github.com/dashpay/dash-network-deploy/issues/151))



# [0.12.0](https://github.com/dashpay/dash-network-deploy/compare/v0.11.1...v0.12.0) (2020-04-19)


### Bug Fixes

* invalid container name in `logs` command ([#146](https://github.com/dashpay/dash-network-deploy/issues/146))
* invalid Nginx headers for gRPC Web ([#147](https://github.com/dashpay/dash-network-deploy/issues/147), [#148](https://github.com/dashpay/dash-network-deploy/issues/148))
* add sleep before starting Drive API ([#138](https://github.com/dashpay/dash-network-deploy/issues/138))
* dapi platform smoke expect not found error instead of null ([9b61af9](https://github.com/dashpay/dash-network-deploy/commit/9b61af93ce584b2e8eb01e8c0d80deba76e0b251))
* gather facts on the first task ([#144](https://github.com/dashpay/dash-network-deploy/issues/144))
* Tendermint peers number assert ignores external nodes ([#140](https://github.com/dashpay/dash-network-deploy/issues/140))


### Code Refactoring

* remove ST Rate Limiter ([#141](https://github.com/dashpay/dash-network-deploy/issues/141))
* rename `TENDERMINT_CORE_...` envs to `TENDERMINT_RPC_...` ([d912d07](https://github.com/dashevo/dash-network-deploy/commit/d912d070ef3ee2591abc9c803cd835ce463d0ae3))


### Features

* update to new Drive ([#145](https://github.com/dashpay/dash-network-deploy/issues/145), [43d3a8f](https://github.com/dashpay/dash-network-deploy/commit/43d3a8f6b05307549e645fbb37185818136392a2), [9a90ae1](https://github.com/dashpay/dash-network-deploy/commit/9a90ae157ebd5ebdc3346822a08cc12bf5950389))
* point to errored node in tendermint block propagation test ([a8b6b81](https://github.com/dashpay/dash-network-deploy/commit/a8b6b81685083ce622a02e3849795a9e9b5f5871))
* introduce monitoring alarms ([#133](https://github.com/dashpay/dash-network-deploy/issues/133), [#135](https://github.com/dashpay/dash-network-deploy/issues/135)) 
* optionally assign root DNS for Insight UI and Faucet ([#139](https://github.com/dashpay/dash-network-deploy/issues/139))
* update deploy script to tag image for every Semver segment ([#149](https://github.com/dashpay/dash-network-deploy/issues/149))


### BREAKING CHANGES

* services setup and configuration is changed (docker compose file)


## [0.11.1](https://github.com/dashevo/dapi/compare/v0.11.0...v0.11.1) (2020-03-27)

### Bug Fixes

* fix invalid travis deploy path ([be442d6](https://github.com/dashevo/dash-network-deploy/commit/be442d6a75a6257c9392dfd0e3acb97f6164df6c))
* add sleep before starting Drive API ([#138](https://github.com/dashpay/dash-network-deploy/issues/138))
* Tendermint peers number assert ignores external nodes ([#140](https://github.com/dashpay/dash-network-deploy/issues/140))


# 0.11.0 (2020-03-09)

### Bug Fixes

* remove temporary Tendermint containers ([#132](https://github.com/dashpay/dash-network-deploy/issues/132))
* adjust smoke test timeouts ([#131](https://github.com/dashpay/dash-network-deploy/issues/131), [415868d](https://github.com/dashevo/dash-network-deploy/commit/415868df492dbea91a01e210634d5ff9376baaa8))
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
* upgrade Terraform to v0.12.23 ([#130](https://github.com/dashpay/dash-network-deploy/issues/130))
* upgrade AWS instances to Ubuntu 18 LTS ([#128](https://github.com/dashpay/dash-network-deploy/issues/128))
* add versions for Docker image ([1356783](https://github.com/dashevo/dash-network-deploy/commit/13567835cc5ebc730ae107d263cd85dd349b73cb))
