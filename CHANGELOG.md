# [0.20.0](https://github.com/dashpay/dash-network-deploy/compare/v0.19.0...v0.20.0) (2021-07-21)


### Features

* integrate latest Tenderdash ([#238](https://github.com/dashpay/dash-network-deploy/issues/238), [#241](https://github.com/dashpay/dash-network-deploy/issues/241))
* migrate Drive state tree to `blake3` ([#243](https://github.com/dashpay/dash-network-deploy/issues/243))
* added Tenderdash logs to Kibana ([#227](https://github.com/dashpay/dash-network-deploy/issues/227))



# [0.19.0](https://github.com/dashpay/dash-network-deploy/compare/v0.18.1...v0.19.0) (2021-05-05)


### Features

* feature flags ([#235](https://github.com/dashpay/dash-network-deploy/issues/235))
* update smoke tests to DAPI v0.19 ([#236](https://github.com/dashpay/dash-network-deploy/issues/236), [#237](https://github.com/dashpay/dash-network-deploy/issues/237))


### Refactoring

* remove Insight API from masternodes ([#232](https://github.com/dashpay/dash-network-deploy/issues/232))



## [0.18.1](https://github.com/dashpay/dash-network-deploy/compare/v0.18.0...v0.18.1) (2021-04-14)


### Bug Fixes

* new llmq-qvvec-sync syntax in 0.17.0.0-rc4 ([#233](https://github.com/dashpay/dash-network-deploy/issues/233))



# [0.18.0](https://github.com/dashpay/dash-network-deploy/compare/v0.18.0-dev.1...v0.18.0) (2021-03-03)


### Bug Fixes

* show correct output in services template ([#228](https://github.com/dashpay/dash-network-deploy/issues/228))
* Tenderdash commands with underscore are deprecated ([#222](https://github.com/dashpay/dash-network-deploy/issues/222)
* pBFT block time went ahead on testnet ([#221](https://github.com/dashpay/dash-network-deploy/issues/221))
* build error due to outdated pip ([#220](https://github.com/dashpay/dash-network-deploy/issues/220))


### Features

* collecting Drive logs to ELK ([#218](https://github.com/dashpay/dash-network-deploy/issues/218), [#225](https://github.com/dashpay/dash-network-deploy/issues/225), [#230](https://github.com/dashpay/dash-network-deploy/issues/230), [#231](https://github.com/dashpay/dash-network-deploy/issues/231))
* support eternal terminal ([#226](https://github.com/dashpay/dash-network-deploy/issues/226), [#229](https://github.com/dashpay/dash-network-deploy/issues/229))
* enable `llmq-qvvec-sync` for Core ([#219](https://github.com/dashpay/dash-network-deploy/issues/219))
* Tenderdash seed nodes ([#213](https://github.com/dashpay/dash-network-deploy/issues/213))


### Refactoring

* remove deprecated CNAME record for seed ([#215](https://github.com/dashpay/dash-network-deploy/issues/215))



## [0.17.1](https://github.com/dashpay/dash-network-deploy/compare/v0.17.0...v0.17.1) (2021-01-11)


### Bug Fixes

* removed `dash_devnet_version` using in smoke tests ([#214](https://github.com/dashpay/dash-network-deploy/issues/214))



# [0.17.0](https://github.com/dashpay/dash-network-deploy/compare/v0.16.2...v0.17.0) (2020-12-30)


### Features

* introduce maximum validators configuration value ([#210](https://github.com/dashpay/dash-network-deploy/issues/210))
* `tenderdash_chain_id` option ([a8c44fd](https://github.com/dashpay/dash-network-deploy/commit/a8c44fd55dd4c64f79c284bbe485063541aedd2b))
* add dashpay environment variables ([#205](https://github.com/dashpay/dash-network-deploy/issues/205))
* enable web and faucet for testnet ([c1f3fbf](https://github.com/dashpay/dash-network-deploy/commit/c1f3fbfc613cb51f104951ee38e014f430caa9fb))
* make two different disk size settings ([6a76c4d](https://github.com/dashpay/dash-network-deploy/commit/6a76c4dfdc52faf6fbec8f19995d55a54f1266a4))
* support dash 0.17 ([#203](https://github.com/dashpay/dash-network-deploy/issues/203))
* unban masternodes ([#202](https://github.com/dashpay/dash-network-deploy/issues/202))
* update to platform v0.17 ([#204](https://github.com/dashpay/dash-network-deploy/issues/204))
* use small instance for web ([fbaea45](https://github.com/dashpay/dash-network-deploy/commit/fbaea452ba0d1df86aa6057f831a71a75715b8dc))
* validate .env in init ([#199](https://github.com/dashpay/dash-network-deploy/issues/199))


### Bug Fixes

* DAPI timed out during broadcast state transition ([16952ff](https://github.com/dashpay/dash-network-deploy/commit/16952fffcfc038be11d62d3946b0657748939f0d))
* peers count is not a number ([3e98b39](https://github.com/dashpay/dash-network-deploy/commit/3e98b3944e4e17424a116eab0e76d89b79412ba6))
* rescan after all keys are imported ([#208](https://github.com/dashpay/dash-network-deploy/issues/208))
* rescan after import for owner keys ([#209](https://github.com/dashpay/dash-network-deploy/issues/209))
* smoke tests expecting tenderdash to connect to all deployed nodes ([3b2bf02](https://github.com/dashpay/dash-network-deploy/commit/3b2bf0285e2e3de2b9a7f0aa04b3795fd5c084d7))
* test true not found ([#211](https://github.com/dashpay/dash-network-deploy/issues/211)) ([6ac98f7](https://github.com/dashpay/dash-network-deploy/commit/6ac98f7d08e0180702d48cba61cb39eb72e3f709))
* `main_domain` option doesn't work for testnet ([#206](https://github.com/dashpay/dash-network-deploy/issues/206))
* wrong devnet chain name assert ([#207](https://github.com/dashpay/dash-network-deploy/issues/207))
* generate command doesn't create configs ([#196](https://github.com/dashpay/dash-network-deploy/issues/196))
* smoke tests can't get the right RPC port and network ([7960f47](https://github.com/dashpay/dash-network-deploy/commit/7960f47d00588735712fce1d5c29758a59de6a60))
* use v3 AWS provider syntax ([#197](https://github.com/dashpay/dash-network-deploy/issues/197))


### BREAKING CHANGES

* 0.16 and lower versions of Core and Platform are not supporting



## [0.16.2](https://github.com/dashpay/dash-network-deploy/compare/v0.16.1...v0.16.2) (2020-11-17)


### Bug Fixes

* outdated sporks ([#195](https://github.com/dashpay/dash-network-deploy/issues/195))



## [0.16.1](https://github.com/dashpay/dash-network-deploy/compare/v0.16.0...v0.16.1) (2020-10-28)


### Features

* pass DPNS contract block height to Drive ([#194](https://github.com/dashpay/dash-network-deploy/issues/194))



# [0.16.0](https://github.com/dashpay/dash-network-deploy/compare/v0.15.0...v0.16.0) (2020-10-28)


### Bug Fixes

* `getinfo` RPC command is removed in DashCore 0.16 ([#191](https://github.com/dashpay/dash-network-deploy/issues/191))


### Features

* update dashd config for DashCore 0.16 ([#190](https://github.com/dashpay/dash-network-deploy/issues/190))
* variables for env and logging level ([#188](https://github.com/dashpay/dash-network-deploy/issues/188), [#189](https://github.com/dashpay/dash-network-deploy/issues/189))


### Chores

* update DAPI Client to 0.16 ([#192](https://github.com/dashpay/dash-network-deploy/issues/188))


### BREAKING CHANGES

* DashCore 0.15 and lower are not supported



# [0.15.0](https://github.com/dashpay/dash-network-deploy/compare/v0.14.0...v0.15.0) (2020-09-04)


### Bug Fixes

* gRPC buffer size settings in NGINX was too small ([#185](https://github.com/dashpay/dash-network-deploy/issues/185))
* MongoDB node is not in primary or recovering state ([#186](https://github.com/dashpay/dash-network-deploy/issues/186))


### Features

* nginx responds with unimplemented in case of unsupported version ([#184](https://github.com/dashpay/dash-network-deploy/issues/184))
* upgrade masternode AWS instance to medium ([#182](https://github.com/dashpay/dash-network-deploy/issues/182))
* increase disk space for masternode root volume ([#179](https://github.com/dashpay/dash-network-deploy/issues/179))
* move `subscribeToTransactionsWithProofs` to `Core` service ([#180](https://github.com/dashpay/dash-network-deploy/issues/180))
* update DAPI Client to 0.15 ([#178](https://github.com/dashpay/dash-network-deploy/issues/178))


### BREAKING CHANGES

* redeploy the infrastructure of existing networks required
* see [Drive breaking changes](https://github.com/dashevo/js-drive/releases/tag/v0.15.0)
* see [DAPI breaking changes](https://github.com/dashevo/dapi/releases/tag/v0.15.0)



# [0.14.0](https://github.com/dashpay/dash-network-deploy/compare/v0.13.1...v0.14.0) (2020-07-24)


### Bug Fixes

* dirty get Tendermint node ID output ([#172](https://github.com/dashpay/dash-network-deploy/issues/172))
* some DNS services block long records ([#170](https://github.com/dashpay/dash-network-deploy/issues/170))
* invalid volumes were added during Tendermint container creation ([#169](https://github.com/dashpay/dash-network-deploy/issues/169))


### Features

* prune all unused docker data ([#173](https://github.com/dashpay/dash-network-deploy/issues/173))



## [0.13.1](https://github.com/dashpay/dash-network-deploy/compare/v0.13.0...v0.13.1) (2020-06-10)


### Bug Fixes

* `swappiness` value is too big ([#166](https://github.com/dashpay/dash-network-deploy/issues/166), [#167](https://github.com/dashpay/dash-network-deploy/issues/166))



# [0.13.0](https://github.com/dashpay/dash-network-deploy/compare/v0.12.4...v0.13.0) (2020-06-09)


### Bug Fixes

* unavailable monitoring apt packets ([#162](https://github.com/dashpay/dash-network-deploy/issues/162))


### Features

* upgrade terraform to 0.12.26 ([#165](https://github.com/dashpay/dash-network-deploy/issues/165))
* versioning for Core and Tendermint devnet networks ([#163](https://github.com/dashpay/dash-network-deploy/issues/163))
* multiple masternode seeds ([#161](https://github.com/dashpay/dash-network-deploy/issues/161))
* monitoring alarms to slack ([#158](https://github.com/dashpay/dash-network-deploy/issues/158), [#160](https://github.com/dashpay/dash-network-deploy/issues/160))
* activate Core sporks ([#156](https://github.com/dashpay/dash-network-deploy/issues/156), [#159](https://github.com/dashpay/dash-network-deploy/issues/159))



## [0.12.4](https://github.com/dashpay/dash-network-deploy/compare/v0.12.3...v0.12.4) (2020-05-20)


### Bug Fixes

* optional `main_domain` throws error if not present ([#157](https://github.com/dashpay/dash-network-deploy/issues/157))



## [0.12.3](https://github.com/dashpay/dash-network-deploy/compare/v0.12.2...v0.12.3) (2020-04-30)


### Improvements

* represent specific unsynced nodes in core smoke tests ([#153](https://github.com/dashpay/dash-network-deploy/issues/153))


## [0.12.2](https://github.com/dashpay/dash-network-deploy/compare/v0.12.1...v0.12.2) (2020-04-21)


### Features

* allow to configure Envoy docker image ([#152](https://github.com/dashpay/dash-network-deploy/issues/152))


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
