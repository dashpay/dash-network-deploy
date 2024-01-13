# [0.25.0](https://github.com/dashpay/dash-network-deploy/compare/v0.25.0-dev.8...v0.25.0) (2024-01-13)

* fix(terraform): InvalidInput error by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/499
* feat!: core v20 and platform v0.25 updates by @strophy in https://github.com/dashpay/dash-network-deploy/pull/490
* feat: initial multi-stage deployment by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/520
* chore: merge master by @strophy in https://github.com/dashpay/dash-network-deploy/pull/523
* fix: multiple initilalizations of bls by @markin-io in https://github.com/dashpay/dash-network-deploy/pull/512
* fix: ansible-lint no-changed-when by @strophy in https://github.com/dashpay/dash-network-deploy/pull/532
* chore: update logs syntax for drive 0.25 by @strophy in https://github.com/dashpay/dash-network-deploy/pull/526
* feat: dashmate for seeds by @pshenmic in https://github.com/dashpay/dash-network-deploy/pull/535
* fix: dashmate config changed on every run by @strophy in https://github.com/dashpay/dash-network-deploy/pull/537
* chore: remove unused todo tasks by @strophy in https://github.com/dashpay/dash-network-deploy/pull/538
* chore: speedup address import by @strophy in https://github.com/dashpay/dash-network-deploy/pull/539
* fix: hpmn methods are deprecated by @strophy in https://github.com/dashpay/dash-network-deploy/pull/540
* chore: support Platform v0.25 by @strophy in https://github.com/dashpay/dash-network-deploy/pull/541
* feat(dashmate): optional initial core chain locked height by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/542
* fix: misnamed vars by @strophy in https://github.com/dashpay/dash-network-deploy/pull/543
* chore: remove sentinel tests by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/544
* chore: revert var name to private_key by @strophy in https://github.com/dashpay/dash-network-deploy/pull/546
* chore: revert replace dashmate config command with config file stat by @strophy in https://github.com/dashpay/dash-network-deploy/pull/547
* chore(release): release 0.25.0-dev.2 by @strophy in https://github.com/dashpay/dash-network-deploy/pull/548
* fix: initial_core_chain_locked_height missing even if defined by @strophy in https://github.com/dashpay/dash-network-deploy/pull/549
* test(dapi): fix data contract not found test by @markin-io in https://github.com/dashpay/dash-network-deploy/pull/550
* refactor: remove `isseednode` by @strophy in https://github.com/dashpay/dash-network-deploy/pull/552
* fix: Error: Timeout of 20000ms exceeded by @strophy in https://github.com/dashpay/dash-network-deploy/pull/553
* feat: coinjoin mixing by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/528
* fix(dashmate): switch back to outdated certificate on deploy by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/556
* chore: remove sentinel by @strophy in https://github.com/dashpay/dash-network-deploy/pull/555
* chore: update docker release and deps by @strophy in https://github.com/dashpay/dash-network-deploy/pull/557
* fix: objc[32080]: +[__NSCFConstantString initialize] may have been in… by @strophy in https://github.com/dashpay/dash-network-deploy/pull/558
* docs: clarify the purpose of running `dashmate config` by @strophy in https://github.com/dashpay/dash-network-deploy/pull/559
* chore: update default versions in config and add vars by @strophy in https://github.com/dashpay/dash-network-deploy/pull/560
* feat(tests): improve smoke tests error reporting by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/561
* fix: AssertionError: no block info by @strophy in https://github.com/dashpay/dash-network-deploy/pull/562
* fix(tests): invalid DAPI error handling by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/564
* fix(tests): unsupported DAPI tests for seed nodes by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/565
* chore: create tenderdash role for seed nodes by @strophy in https://github.com/dashpay/dash-network-deploy/pull/567
* chore: fix linting errors by @strophy in https://github.com/dashpay/dash-network-deploy/pull/568
* chore: install jq once only by @strophy in https://github.com/dashpay/dash-network-deploy/pull/569
* chore: replace cloudwatch mon script with cloudwatch agent by @strophy in https://github.com/dashpay/dash-network-deploy/pull/570
* chore: add drive abci epoch time to config by @strophy in https://github.com/dashpay/dash-network-deploy/pull/571
* chore: push Drive logs from the file by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/573
* fix: dashmate restart logic by @strophy in https://github.com/dashpay/dash-network-deploy/pull/575
* chore: update filebeat platform template for tenderdash logs by @strophy in https://github.com/dashpay/dash-network-deploy/pull/576
* fix(test)!: wrong error expected by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/578
* chore(release): bump version to 0.25.0-dev.8 by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/579
* chore: limit metrics collection by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/580
* chore: update cloudwatch monitoring by @strophy in https://github.com/dashpay/dash-network-deploy/pull/572
* chore: update filebeat templates to support drive from file and tenderdash only on logs nodes by @strophy in https://github.com/dashpay/dash-network-deploy/pull/581
* chore: use instance store for logs data by @strophy in https://github.com/dashpay/dash-network-deploy/pull/563
* chore: make monitoring config more granular by @strophy in https://github.com/dashpay/dash-network-deploy/pull/583
* chore: change instance type by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/584
* feat!: add GroveDb operations log by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/582
* fix: extra comma causing json schema validation error by @strophy in https://github.com/dashpay/dash-network-deploy/pull/586
* chore: enable full text indexing on tenderdash errors by @strophy in https://github.com/dashpay/dash-network-deploy/pull/588
* fix: drive log specification missing grovedb ops by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/589
* chore: update terraform and deps by @strophy in https://github.com/dashpay/dash-network-deploy/pull/590
* fix: alarm dimensions by @strophy in https://github.com/dashpay/dash-network-deploy/pull/587
* chore: log only grovedb operaions by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/592
* feat: generate minimal dash.conf file in configs repo by @strophy in https://github.com/dashpay/dash-network-deploy/pull/593
* chore: make logs node type a variable by @strophy in https://github.com/dashpay/dash-network-deploy/pull/594
* chore(dashmate): change ssl dir path by @pshenmic in https://github.com/dashpay/dash-network-deploy/pull/595
* chore(dashmate): add `core.docker.commandArgs` option by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/597
* fix: *_hpmn methods are deprecated. Use the related *_evo methods by @strophy in https://github.com/dashpay/dash-network-deploy/pull/598
* Fix: ensure seed listens by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/599
* chore: update to new dashmate version by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/601
* feat: upgrade Node to 20 (LTS) by @pshenmic in https://github.com/dashpay/dash-network-deploy/pull/600
* fix: increase timeout on sendtx test by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/602
* chore: fix mixer nodes by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/603
* chore: open tenderdash metrics port for private network by @ktechmidas in https://github.com/dashpay/dash-network-deploy/pull/604
* chore!: update to dashmate 0.25.16 by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/605
* fix: invalid tenderdash metrics host by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/606
* chore!: update dashmate config for v0.25.20 by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/608
* feat: configure grovedb operation logs by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/609
* fix: object of type 'NoneType' has no len() by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/610
* chore: update es 8.11.3 by @strophy in https://github.com/dashpay/dash-network-deploy/pull/611
* feat: ssh to host command by @shumkov in https://github.com/dashpay/dash-network-deploy/pull/614


# [0.23.0](https://github.com/dashpay/dash-network-deploy/compare/v0.23.0-dev.4...v0.23.0) (2022-12-07)

### Bug Fixes

* collaterals being spent when creating protx ([#400](https://github.com/dashpay/dash-network-deploy/issues/400)) ([eb57e6c](https://github.com/dashpay/dash-network-deploy/commit/eb57e6cefdd95f22644bd9be664376e277448d73))
* deploy fails silently if current branch not at HEAD ([#393](https://github.com/dashpay/dash-network-deploy/issues/393)) ([95ed0f6](https://github.com/dashpay/dash-network-deploy/commit/95ed0f6be989e261af933129fb5c09cd061f276a))
* double platform service startup ([#399](https://github.com/dashpay/dash-network-deploy/issues/399)) ([b414e09](https://github.com/dashpay/dash-network-deploy/commit/b414e090b007ccc6a08b07de3fb35eab2a3850f9))
* faucet doesn't pay out ([#395](https://github.com/dashpay/dash-network-deploy/issues/395)) ([2046dcb](https://github.com/dashpay/dash-network-deploy/commit/2046dcb33ea457ceb4708f2194b76d0acc7f770e))
* faucet shows connection error on payout ([#402](https://github.com/dashpay/dash-network-deploy/issues/402)) ([f4145d4](https://github.com/dashpay/dash-network-deploy/commit/f4145d414fecad966256dbae23e573aca52c0cd9))
* inventory is updated twice ([#391](https://github.com/dashpay/dash-network-deploy/issues/391)) ([058cd9a](https://github.com/dashpay/dash-network-deploy/commit/058cd9a88a4e073f47d825bc52ba22864e3439a1))
* kibana unavailable despite passing check ([#379](https://github.com/dashpay/dash-network-deploy/issues/379)) ([e7e80db](https://github.com/dashpay/dash-network-deploy/commit/e7e80db0e8c737ee12dbff6ef6a9edae3740ca84))
* regtest_generate is confusingly named ([#397](https://github.com/dashpay/dash-network-deploy/issues/397)) ([dbb2e12](https://github.com/dashpay/dash-network-deploy/commit/dbb2e120afb35e9ee4645856aef553963fe48430))
* add zmqpubrawblock topic to the dash.conf ([#355](https://github.com/dashpay/dash-network-deploy/issues/355)) ([bfca085](https://github.com/dashpay/dash-network-deploy/commit/bfca085c4fcfc2f6c4a7390de7fcdd3fdd0ed78e))
* ansible.netcommon deprecation ([#344](https://github.com/dashpay/dash-network-deploy/issues/344)) ([af4bab3](https://github.com/dashpay/dash-network-deploy/commit/af4bab3b21c7574f00fc849efcf8e9cb090a88ba))
* node type vars inconsistent with config ([#369](https://github.com/dashpay/dash-network-deploy/issues/369)) ([85fe39f](https://github.com/dashpay/dash-network-deploy/commit/85fe39fc3e95302b80d0e83f5dcaf457d047100d))
* permission denied reading file on shared manager node ([#363](https://github.com/dashpay/dash-network-deploy/issues/363)) ([d1dc8d5](https://github.com/dashpay/dash-network-deploy/commit/d1dc8d5951512502e7b978cabe463e6f009b1724))
* platform logs not rotated hourly ([#347](https://github.com/dashpay/dash-network-deploy/issues/347)) ([93636dd](https://github.com/dashpay/dash-network-deploy/commit/93636dd64294f3215e17242ced17a5c2e9ea727d))
* reindex needed after restart ([#366](https://github.com/dashpay/dash-network-deploy/issues/366)) ([7720ddb](https://github.com/dashpay/dash-network-deploy/commit/7720ddbb40dd22a61c73a35f1db05acc93348966))
* cannot attach to docker context with ubuntu key ([#298](https://github.com/dashpay/dash-network-deploy/issues/298)) ([a554f53](https://github.com/dashpay/dash-network-deploy/commit/a554f5314442637d7806253e14a1ce28edad523f))
* drive volume mount point ([#300](https://github.com/dashpay/dash-network-deploy/issues/300)) ([df01fba](https://github.com/dashpay/dash-network-deploy/commit/df01fbaa50465c6675fd6b3ac895e3b28fe41894)), closes [#289](https://github.com/dashpay/dash-network-deploy/issues/289) [#289](https://github.com/dashpay/dash-network-deploy/issues/289)
* failed to parse log level (*:debug) ([#321](https://github.com/dashpay/dash-network-deploy/issues/321)) ([1d548d4](https://github.com/dashpay/dash-network-deploy/commit/1d548d44f082271533d093b4b2371d7ebd0a0c82))
* generate command not found with core 18.1.0 ([#297](https://github.com/dashpay/dash-network-deploy/issues/297)) ([b492af2](https://github.com/dashpay/dash-network-deploy/commit/b492af24422fc30b10d87ff33aa1f940f2804ad5))
* no value can start with v ([#316](https://github.com/dashpay/dash-network-deploy/issues/316)) ([8ba1239](https://github.com/dashpay/dash-network-deploy/commit/8ba12396adf230d0a31f124d0c16ce937b0b8fe7))
* outdated tenderdash configs ([#324](https://github.com/dashpay/dash-network-deploy/issues/324)) ([ebad5c8](https://github.com/dashpay/dash-network-deploy/commit/ebad5c8eb49d2d3b61078d706cd453fb59a71b30))
* platform logs not present filebeat error ([#287](https://github.com/dashpay/dash-network-deploy/issues/287)) ([50b7de8](https://github.com/dashpay/dash-network-deploy/commit/50b7de88bb0588dce0c6b94344844d67c4c2ed73))
* tests running from wrong branch ([#342](https://github.com/dashpay/dash-network-deploy/issues/342)) ([cfce703](https://github.com/dashpay/dash-network-deploy/commit/cfce703335c2c5a7516a09cf164653c11b4bf25f))
* Use getgovinfo in RPC check ([#310](https://github.com/dashpay/dash-network-deploy/issues/310)) ([2c2b013](https://github.com/dashpay/dash-network-deploy/commit/2c2b01335032b01c73c41832ab4ccd436415b589))
* use local directory in case of multiple users ([#330](https://github.com/dashpay/dash-network-deploy/issues/330)) ([faa9f38](https://github.com/dashpay/dash-network-deploy/commit/faa9f38358bcc8f70c09ba8e8b1c7549f14100c5))


### Features

* check recent mining performance instead of waiting for blocks ([#387](https://github.com/dashpay/dash-network-deploy/issues/387)) ([7d32585](https://github.com/dashpay/dash-network-deploy/commit/7d32585bf04bd9510367064038d0a7ac31b02765))
* create funding transactions faster using `sendmany` ([#383](https://github.com/dashpay/dash-network-deploy/issues/383)) ([644a024](https://github.com/dashpay/dash-network-deploy/commit/644a024a940a04686bf19f955a6e724dfde373cc))
* destroy platform ([#367](https://github.com/dashpay/dash-network-deploy/issues/367)) ([923ea7f](https://github.com/dashpay/dash-network-deploy/commit/923ea7f99c41844584efb6976fadf10fb02ebb38))
* faucet wallet and theme updates ([#394](https://github.com/dashpay/dash-network-deploy/issues/394)) ([8b70eac](https://github.com/dashpay/dash-network-deploy/commit/8b70eaccf6109e9560a9f6155b46ba333dd3cfb9))
* individual MN debug toggle ([#392](https://github.com/dashpay/dash-network-deploy/issues/392)) ([4cb8359](https://github.com/dashpay/dash-network-deploy/commit/4cb8359ecf28c6db9edaa17a837b9dbc30b61209))
* insight acm certs ([#378](https://github.com/dashpay/dash-network-deploy/issues/378)) ([8520312](https://github.com/dashpay/dash-network-deploy/commit/8520312b4f65b55ba4d2586cb421931e5a78b16d))
* logs destroy target ([#396](https://github.com/dashpay/dash-network-deploy/issues/396)) ([b4674f6](https://github.com/dashpay/dash-network-deploy/commit/b4674f6e5d8cc562005e6058da824f7c64cef9f5))
* single wallet node for wallet and mno ([#390](https://github.com/dashpay/dash-network-deploy/issues/390)) ([f756a25](https://github.com/dashpay/dash-network-deploy/commit/f756a250aab37a6322721dbf1d90cb0d4ba8d5dc))
* logrotate for core debug.log ([#346](https://github.com/dashpay/dash-network-deploy/issues/346)) ([68e70e2](https://github.com/dashpay/dash-network-deploy/commit/68e70e2e3b083f7f3e0069d8284eb0afde074d5f))
* add powtargetspacing to dash.conf vars ([#315](https://github.com/dashpay/dash-network-deploy/issues/315)) ([fe39650](https://github.com/dashpay/dash-network-deploy/commit/fe396507d1caf517f49f4bd915dafce94a990116))
* arm64 nodes ([#299](https://github.com/dashpay/dash-network-deploy/issues/299)) ([ac5715d](https://github.com/dashpay/dash-network-deploy/commit/ac5715d5e9fb4a03ee62fbe281b1d12f81c66d5a))
* changes to support devnets with quorum rotation ([#291](https://github.com/dashpay/dash-network-deploy/issues/291)) ([1848af7](https://github.com/dashpay/dash-network-deploy/commit/1848af7f575ec6b68d938ded74eb3398f99e6c0d))
* conditional core/platform elastic beats ([#325](https://github.com/dashpay/dash-network-deploy/issues/325)) ([726f5ef](https://github.com/dashpay/dash-network-deploy/commit/726f5ef2bd313dbe7354220daa9de525c104e887))
* disable extra block production in tenderdash ([#339](https://github.com/dashpay/dash-network-deploy/issues/339)) ([e053e86](https://github.com/dashpay/dash-network-deploy/commit/e053e864e23777b1e284a6b2be3c38da5343add4))
* generate second private keys for system identities ([#294](https://github.com/dashpay/dash-network-deploy/issues/294)) ([a8a40be](https://github.com/dashpay/dash-network-deploy/commit/a8a40be41f91a21992815f2755ab423c109d24fd))
* make tenderdash log_level configurable ([#288](https://github.com/dashpay/dash-network-deploy/issues/288)) ([3892abf](https://github.com/dashpay/dash-network-deploy/commit/3892abf102dc42ab7b753f57821ff96fd94d9b75))
* update tenderdash config for v0.8 ([#319](https://github.com/dashpay/dash-network-deploy/issues/319)) ([b350a8e](https://github.com/dashpay/dash-network-deploy/commit/b350a8e78204b5bbf17ccd1c732e4a9bd66105ff))
* write protx values to config inventory file ([#293](https://github.com/dashpay/dash-network-deploy/issues/293)) ([44ec014](https://github.com/dashpay/dash-network-deploy/commit/44ec01412b2b178add3c568fe398d30a26b516fe))


### Continuous integration

* update deps ([#371](https://github.com/dashpay/dash-network-deploy/issues/396))


### Performance Improvements

* speedup karma tests ([#353](https://github.com/dashpay/dash-network-deploy/issues/353)) ([fd0ddb2](https://github.com/dashpay/dash-network-deploy/commit/fd0ddb2c4c99a5d3f96ad9bfe5380d3f0a85e2b7))



# [0.23.0-dev.4](https://github.com/dashpay/dash-network-deploy/compare/v0.23.0-dev.3...v0.23.0-dev.4) (2022-11-25)


### Bug Fixes

* collaterals being spent when creating protx ([#400](https://github.com/dashpay/dash-network-deploy/issues/400)) ([eb57e6c](https://github.com/dashpay/dash-network-deploy/commit/eb57e6cefdd95f22644bd9be664376e277448d73))
* deploy fails silently if current branch not at HEAD ([#393](https://github.com/dashpay/dash-network-deploy/issues/393)) ([95ed0f6](https://github.com/dashpay/dash-network-deploy/commit/95ed0f6be989e261af933129fb5c09cd061f276a))
* double platform service startup ([#399](https://github.com/dashpay/dash-network-deploy/issues/399)) ([b414e09](https://github.com/dashpay/dash-network-deploy/commit/b414e090b007ccc6a08b07de3fb35eab2a3850f9))
* faucet doesn't pay out ([#395](https://github.com/dashpay/dash-network-deploy/issues/395)) ([2046dcb](https://github.com/dashpay/dash-network-deploy/commit/2046dcb33ea457ceb4708f2194b76d0acc7f770e))
* faucet shows connection error on payout ([#402](https://github.com/dashpay/dash-network-deploy/issues/402)) ([f4145d4](https://github.com/dashpay/dash-network-deploy/commit/f4145d414fecad966256dbae23e573aca52c0cd9))
* inventory is updated twice ([#391](https://github.com/dashpay/dash-network-deploy/issues/391)) ([058cd9a](https://github.com/dashpay/dash-network-deploy/commit/058cd9a88a4e073f47d825bc52ba22864e3439a1))
* kibana unavailable despite passing check ([#379](https://github.com/dashpay/dash-network-deploy/issues/379)) ([e7e80db](https://github.com/dashpay/dash-network-deploy/commit/e7e80db0e8c737ee12dbff6ef6a9edae3740ca84))
* regtest_generate is confusingly named ([#397](https://github.com/dashpay/dash-network-deploy/issues/397)) ([dbb2e12](https://github.com/dashpay/dash-network-deploy/commit/dbb2e120afb35e9ee4645856aef553963fe48430))


### Features

* check recent mining performance instead of waiting for blocks ([#387](https://github.com/dashpay/dash-network-deploy/issues/387)) ([7d32585](https://github.com/dashpay/dash-network-deploy/commit/7d32585bf04bd9510367064038d0a7ac31b02765))
* create funding transactions faster using `sendmany` ([#383](https://github.com/dashpay/dash-network-deploy/issues/383)) ([644a024](https://github.com/dashpay/dash-network-deploy/commit/644a024a940a04686bf19f955a6e724dfde373cc))
* destroy platform ([#367](https://github.com/dashpay/dash-network-deploy/issues/367)) ([923ea7f](https://github.com/dashpay/dash-network-deploy/commit/923ea7f99c41844584efb6976fadf10fb02ebb38))
* faucet wallet and theme updates ([#394](https://github.com/dashpay/dash-network-deploy/issues/394)) ([8b70eac](https://github.com/dashpay/dash-network-deploy/commit/8b70eaccf6109e9560a9f6155b46ba333dd3cfb9))
* individual MN debug toggle ([#392](https://github.com/dashpay/dash-network-deploy/issues/392)) ([4cb8359](https://github.com/dashpay/dash-network-deploy/commit/4cb8359ecf28c6db9edaa17a837b9dbc30b61209))
* insight acm certs ([#378](https://github.com/dashpay/dash-network-deploy/issues/378)) ([8520312](https://github.com/dashpay/dash-network-deploy/commit/8520312b4f65b55ba4d2586cb421931e5a78b16d))
* logs destroy target ([#396](https://github.com/dashpay/dash-network-deploy/issues/396)) ([b4674f6](https://github.com/dashpay/dash-network-deploy/commit/b4674f6e5d8cc562005e6058da824f7c64cef9f5))
* single wallet node for wallet and mno ([#390](https://github.com/dashpay/dash-network-deploy/issues/390)) ([f756a25](https://github.com/dashpay/dash-network-deploy/commit/f756a250aab37a6322721dbf1d90cb0d4ba8d5dc))



# [0.23.0-dev.3](https://github.com/dashpay/dash-network-deploy/compare/v0.23.0-dev.2...v0.23.0-dev.3) (2022-10-19)

### Continuous integration

* update deps ([#371](https://github.com/dashpay/dash-network-deploy/issues/396))


# [0.23.0-dev.2](https://github.com/dashpay/dash-network-deploy/compare/v0.22.3...v0.23.0-dev.2) (2022-10-19)


### Bug Fixes

* add zmqpubrawblock topic to the dash.conf ([#355](https://github.com/dashpay/dash-network-deploy/issues/355)) ([bfca085](https://github.com/dashpay/dash-network-deploy/commit/bfca085c4fcfc2f6c4a7390de7fcdd3fdd0ed78e))
* ansible.netcommon deprecation ([#344](https://github.com/dashpay/dash-network-deploy/issues/344)) ([af4bab3](https://github.com/dashpay/dash-network-deploy/commit/af4bab3b21c7574f00fc849efcf8e9cb090a88ba))
* node type vars inconsistent with config ([#369](https://github.com/dashpay/dash-network-deploy/issues/369)) ([85fe39f](https://github.com/dashpay/dash-network-deploy/commit/85fe39fc3e95302b80d0e83f5dcaf457d047100d))
* permission denied reading file on shared manager node ([#363](https://github.com/dashpay/dash-network-deploy/issues/363)) ([d1dc8d5](https://github.com/dashpay/dash-network-deploy/commit/d1dc8d5951512502e7b978cabe463e6f009b1724))
* platform logs not rotated hourly ([#347](https://github.com/dashpay/dash-network-deploy/issues/347)) ([93636dd](https://github.com/dashpay/dash-network-deploy/commit/93636dd64294f3215e17242ced17a5c2e9ea727d))
* reindex needed after restart ([#366](https://github.com/dashpay/dash-network-deploy/issues/366)) ([7720ddb](https://github.com/dashpay/dash-network-deploy/commit/7720ddbb40dd22a61c73a35f1db05acc93348966))


### Features

* logrotate for core debug.log ([#346](https://github.com/dashpay/dash-network-deploy/issues/346)) ([68e70e2](https://github.com/dashpay/dash-network-deploy/commit/68e70e2e3b083f7f3e0069d8284eb0afde074d5f))


### Performance Improvements

* speedup karma tests ([#353](https://github.com/dashpay/dash-network-deploy/issues/353)) ([fd0ddb2](https://github.com/dashpay/dash-network-deploy/commit/fd0ddb2c4c99a5d3f96ad9bfe5380d3f0a85e2b7))



# [0.23.0-dev.1](https://github.com/dashpay/dash-network-deploy/compare/v0.22.2...v0.23.0-dev.1) (2022-08-24)


### Bug Fixes

* cannot attach to docker context with ubuntu key ([#298](https://github.com/dashpay/dash-network-deploy/issues/298)) ([a554f53](https://github.com/dashpay/dash-network-deploy/commit/a554f5314442637d7806253e14a1ce28edad523f))
* drive volume mount point ([#300](https://github.com/dashpay/dash-network-deploy/issues/300)) ([df01fba](https://github.com/dashpay/dash-network-deploy/commit/df01fbaa50465c6675fd6b3ac895e3b28fe41894)), closes [#289](https://github.com/dashpay/dash-network-deploy/issues/289) [#289](https://github.com/dashpay/dash-network-deploy/issues/289)
* failed to parse log level (*:debug) ([#321](https://github.com/dashpay/dash-network-deploy/issues/321)) ([1d548d4](https://github.com/dashpay/dash-network-deploy/commit/1d548d44f082271533d093b4b2371d7ebd0a0c82))
* generate command not found with core 18.1.0 ([#297](https://github.com/dashpay/dash-network-deploy/issues/297)) ([b492af2](https://github.com/dashpay/dash-network-deploy/commit/b492af24422fc30b10d87ff33aa1f940f2804ad5))
* no value can start with v ([#316](https://github.com/dashpay/dash-network-deploy/issues/316)) ([8ba1239](https://github.com/dashpay/dash-network-deploy/commit/8ba12396adf230d0a31f124d0c16ce937b0b8fe7))
* outdated tenderdash configs ([#324](https://github.com/dashpay/dash-network-deploy/issues/324)) ([ebad5c8](https://github.com/dashpay/dash-network-deploy/commit/ebad5c8eb49d2d3b61078d706cd453fb59a71b30))
* platform logs not present filebeat error ([#287](https://github.com/dashpay/dash-network-deploy/issues/287)) ([50b7de8](https://github.com/dashpay/dash-network-deploy/commit/50b7de88bb0588dce0c6b94344844d67c4c2ed73))
* tests running from wrong branch ([#342](https://github.com/dashpay/dash-network-deploy/issues/342)) ([cfce703](https://github.com/dashpay/dash-network-deploy/commit/cfce703335c2c5a7516a09cf164653c11b4bf25f))
* Use getgovinfo in RPC check ([#310](https://github.com/dashpay/dash-network-deploy/issues/310)) ([2c2b013](https://github.com/dashpay/dash-network-deploy/commit/2c2b01335032b01c73c41832ab4ccd436415b589))
* use local directory in case of multiple users ([#330](https://github.com/dashpay/dash-network-deploy/issues/330)) ([faa9f38](https://github.com/dashpay/dash-network-deploy/commit/faa9f38358bcc8f70c09ba8e8b1c7549f14100c5))


### Features

* add powtargetspacing to dash.conf vars ([#315](https://github.com/dashpay/dash-network-deploy/issues/315)) ([fe39650](https://github.com/dashpay/dash-network-deploy/commit/fe396507d1caf517f49f4bd915dafce94a990116))
* arm64 nodes ([#299](https://github.com/dashpay/dash-network-deploy/issues/299)) ([ac5715d](https://github.com/dashpay/dash-network-deploy/commit/ac5715d5e9fb4a03ee62fbe281b1d12f81c66d5a))
* changes to support devnets with quorum rotation ([#291](https://github.com/dashpay/dash-network-deploy/issues/291)) ([1848af7](https://github.com/dashpay/dash-network-deploy/commit/1848af7f575ec6b68d938ded74eb3398f99e6c0d))
* conditional core/platform elastic beats ([#325](https://github.com/dashpay/dash-network-deploy/issues/325)) ([726f5ef](https://github.com/dashpay/dash-network-deploy/commit/726f5ef2bd313dbe7354220daa9de525c104e887))
* disable extra block production in tenderdash ([#339](https://github.com/dashpay/dash-network-deploy/issues/339)) ([e053e86](https://github.com/dashpay/dash-network-deploy/commit/e053e864e23777b1e284a6b2be3c38da5343add4))
* generate second private keys for system identities ([#294](https://github.com/dashpay/dash-network-deploy/issues/294)) ([a8a40be](https://github.com/dashpay/dash-network-deploy/commit/a8a40be41f91a21992815f2755ab423c109d24fd))
* make tenderdash log_level configurable ([#288](https://github.com/dashpay/dash-network-deploy/issues/288)) ([3892abf](https://github.com/dashpay/dash-network-deploy/commit/3892abf102dc42ab7b753f57821ff96fd94d9b75))
* update tenderdash config for v0.8 ([#319](https://github.com/dashpay/dash-network-deploy/issues/319)) ([b350a8e](https://github.com/dashpay/dash-network-deploy/commit/b350a8e78204b5bbf17ccd1c732e4a9bd66105ff))
* write protx values to config inventory file ([#293](https://github.com/dashpay/dash-network-deploy/issues/293)) ([44ec014](https://github.com/dashpay/dash-network-deploy/commit/44ec01412b2b178add3c568fe398d30a26b516fe))



# [0.22.0](https://github.com/dashpay/dash-network-deploy/compare/v0.21.0...v0.22.0) (2022-03-21)


### Bug Fixes

* destroy fails due to mounted elastic data ([#276](https://github.com/dashpay/dash-network-deploy/issues/276))
* mn-init unbans all nodes every time ([#266](https://github.com/dashpay/dash-network-deploy/issues/266))
* smoke tests ([#284](https://github.com/dashpay/dash-network-deploy/issues/284))
* `subscribeToBlockHeadersWithChainLocks` is not reachable ([#282](https://github.com/dashpay/dash-network-deploy/issues/282))


### Features

* add core logs to elasticsearch ([#270](https://github.com/dashpay/dash-network-deploy/issues/270))
* add devnet check ([#275](https://github.com/dashpay/dash-network-deploy/issues/275))
* generate keys for system data contracts ([#279](https://github.com/dashpay/dash-network-deploy/issues/279))
* implement elasticsearch cluster ([#267](https://github.com/dashpay/dash-network-deploy/issues/267))
* core traffic logs ([#280](https://github.com/dashpay/dash-network-deploy/issues/280))
* modify compose commands to use yarn ([#274](https://github.com/dashpay/dash-network-deploy/issues/274), [#278](https://github.com/dashpay/dash-network-deploy/issues/278))
* speed up masternodes syncing ([#277](https://github.com/dashpay/dash-network-deploy/issues/277))



# [0.21.0](https://github.com/dashpay/dash-network-deploy/compare/v0.20.0...v0.21.0) (2021-10-29)


### Features

* atomic latency option added to Ansible ([#255](https://github.com/dashpay/dash-network-deploy/issues/255))


### Chores

* migrate to Node.JS 16 ([#260](https://github.com/dashevo/dash-network-deploy/pull/260))
* ansible improvements ([#254](https://github.com/dashevo/dash-network-deploy/pull/254))
* update terraform to version 1.0.5 ([#253](https://github.com/dashevo/dash-network-deploy/pull/253))


### Bug Fixes

* network fork on restart ([#263](https://github.com/dashpay/dash-network-deploy/issues/263))



# [0.20.0](https://github.com/dashpay/dash-network-deploy/compare/v0.19.0...v0.20.0) (2021-07-21)


### Features

* integrate latest Tenderdash ([#238](https://github.com/dashpay/dash-network-deploy/issues/238), [#241](https://github.com/dashpay/dash-network-deploy/issues/241))
* migrate Drive state tree to `blake3` ([#243](https://github.com/dashpay/dash-network-deploy/issues/243))
* added Tenderdash logs to Kibana ([#227](https://github.com/dashpay/dash-network-deploy/issues/227))


### BREAKING CHANGES

* not compatible with Dash Platform v0.19 and lower



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
