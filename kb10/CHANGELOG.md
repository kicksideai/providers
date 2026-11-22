# Changelog

## [0.2.50](https://github.com/kicksideai/providers/compare/kb10-v0.2.49...kb10-v0.2.50) (2026-11-22)


### Bug Fixes

* **kb10:** acknowledge ordinary source prefixes before the deadline ([#224](https://github.com/kicksideai/providers/issues/224)) ([3a2fa3b](https://github.com/kicksideai/providers/commit/3a2fa3b03372c348324aec246c5d93048fb5dd43))

## [0.2.49](https://github.com/kicksideai/providers/compare/kb10-v0.2.48...kb10-v0.2.49) (2026-11-22)


### Bug Fixes

* **kb10:** read SurveyKB totals from the store ([#225](https://github.com/kicksideai/providers/issues/225)) ([4872ad7](https://github.com/kicksideai/providers/commit/4872ad7495d676c99c3ab074474bb9cf35f49fde))

## [0.2.48](https://github.com/kicksideai/providers/compare/kb10-v0.2.47...kb10-v0.2.48) (2026-11-21)


### Bug Fixes

* **kb10:** publish slow source pages in complete prefixes ([#222](https://github.com/kicksideai/providers/issues/222)) ([86244e8](https://github.com/kicksideai/providers/commit/86244e8d136e6d8f2c92e109320acb5ae13d14e5))

## [0.2.47](https://github.com/kicksideai/providers/compare/kb10-v0.2.46...kb10-v0.2.47) (2026-11-21)


### Bug Fixes

* **kb10:** preserve legacy empty answer settings ([#220](https://github.com/kicksideai/providers/issues/220)) ([7ea94b0](https://github.com/kicksideai/providers/commit/7ea94b06ed567e990c97c8a56c7a6c46b19f0164))

## [0.2.46](https://github.com/kicksideai/providers/compare/kb10-v0.2.45...kb10-v0.2.46) (2026-11-21)


### Bug Fixes

* **kb10:** settle shared source fan-out with its cursor ([f577a0d](https://github.com/kicksideai/providers/commit/f577a0d463cdce0c97ccc5ab0f122fa7c7354770))

## [0.2.45](https://github.com/kicksideai/providers/compare/kb10-v0.2.44...kb10-v0.2.45) (2026-11-21)


### Performance Improvements

* **kb10:** seek export pages by store and row key ([#215](https://github.com/kicksideai/providers/issues/215)) ([757947b](https://github.com/kicksideai/providers/commit/757947bcf264cbd07da2c45a5b226dd218bef1f0))

## [0.2.44](https://github.com/kicksideai/providers/compare/kb10-v0.2.43...kb10-v0.2.44) (2026-11-21)


### Bug Fixes

* **kb10:** commit ordinary source fan-out atomically ([#213](https://github.com/kicksideai/providers/issues/213)) ([388d3bd](https://github.com/kicksideai/providers/commit/388d3bd6fa6c993f058d8eb830b051b07c3f20b4))

## [0.2.43](https://github.com/kicksideai/providers/compare/kb10-v0.2.42...kb10-v0.2.43) (2026-11-21)


### Features

* **kb10:** expose publication materialization outcomes ([ca0b0b2](https://github.com/kicksideai/providers/commit/ca0b0b2734f1017e3d9702c210467424dea34bef))


### Bug Fixes

* **kb10:** bind Activity lookups in SQL order ([d1b143a](https://github.com/kicksideai/providers/commit/d1b143a92de39e458b1e58a53173160f9b2a0eb3))

## [0.2.42](https://github.com/kicksideai/providers/compare/kb10-v0.2.41...kb10-v0.2.42) (2026-11-20)


### Features

* **kb10:** retry failed document indexing ([#208](https://github.com/kicksideai/providers/issues/208)) ([3137835](https://github.com/kicksideai/providers/commit/31378353e89256b9094b01fde6f2aada637f272e))

## [0.2.41](https://github.com/kicksideai/providers/compare/kb10-v0.2.40...kb10-v0.2.41) (2026-11-20)


### Bug Fixes

* **kb10:** preserve UTF-8 in fallback summaries ([#206](https://github.com/kicksideai/providers/issues/206)) ([b62d94c](https://github.com/kicksideai/providers/commit/b62d94ce76db3b124bac3da6ba20493a884e3e13))

## [0.2.40](https://github.com/kicksideai/providers/compare/kb10-v0.2.39...kb10-v0.2.40) (2026-11-20)


### Bug Fixes

* **kb10:** recover installed source publications across retries ([#204](https://github.com/kicksideai/providers/issues/204)) ([d6b87a8](https://github.com/kicksideai/providers/commit/d6b87a884685ed6cd775cf9dc9ef578d4adc2b8e))

## [0.2.39](https://github.com/kicksideai/providers/compare/kb10-v0.2.38...kb10-v0.2.39) (2026-11-20)


### Performance Improvements

* **kb10:** bound escaped spreadsheet cell splitting ([#202](https://github.com/kicksideai/providers/issues/202)) ([176dc75](https://github.com/kicksideai/providers/commit/176dc7560dc8960edda4004ca4a5f7d3c7507bef))

## [0.2.38](https://github.com/kicksideai/providers/compare/kb10-v0.2.37...kb10-v0.2.38) (2026-11-20)


### Bug Fixes

* **kb10:** finalize resumed source pages with an empty tail ([#199](https://github.com/kicksideai/providers/issues/199)) ([c6843f7](https://github.com/kicksideai/providers/commit/c6843f70aba13c68c5bedbf63648ce72f30a24c2))

## [0.2.37](https://github.com/kicksideai/providers/compare/kb10-v0.2.36...kb10-v0.2.37) (2026-11-20)


### Bug Fixes

* **kb10:** finalize productive pages with an empty source tail ([c082f82](https://github.com/kicksideai/providers/commit/c082f82cfc43944897e5ec87c376631cd82fc51c))

## [0.2.36](https://github.com/kicksideai/providers/compare/kb10-v0.2.35...kb10-v0.2.36) (2026-11-20)


### Bug Fixes

* **kb10:** reject verified immutable upload corruption ([2d1bf93](https://github.com/kicksideai/providers/commit/2d1bf93d52c56f964db90d0738ec4b5d26665a29))

## [0.2.35](https://github.com/kicksideai/providers/compare/kb10-v0.2.34...kb10-v0.2.35) (2026-11-20)


### Bug Fixes

* **kb10:** identify failed sources and show indexing errors ([#192](https://github.com/kicksideai/providers/issues/192)) ([1206f81](https://github.com/kicksideai/providers/commit/1206f81ee70f81881c17ce8dae358f047627f51f))

## [0.2.34](https://github.com/kicksideai/providers/compare/kb10-v0.2.33...kb10-v0.2.34) (2026-11-20)


### Bug Fixes

* **kb10:** keep source maps out of production bundles ([1639469](https://github.com/kicksideai/providers/commit/16394691684a90f552c35d016148addcc63bffaf))

## [0.2.33](https://github.com/kicksideai/providers/compare/kb10-v0.2.32...kb10-v0.2.33) (2026-11-19)


### Bug Fixes

* **kb10:** clear the document link after its deletion is accepted ([#186](https://github.com/kicksideai/providers/issues/186)) ([dc23cb8](https://github.com/kicksideai/providers/commit/dc23cb883e5e18fd0e8c03f2f2539c094b75ce91))

## [0.2.32](https://github.com/kicksideai/providers/compare/kb10-v0.2.31...kb10-v0.2.32) (2026-11-19)


### Bug Fixes

* **kb10:** surface batch upload failures in the library drawer ([#182](https://github.com/kicksideai/providers/issues/182)) ([4d74641](https://github.com/kicksideai/providers/commit/4d74641c2437a0439c3dd44a583b92ddbffc9e97))

## [0.2.31](https://github.com/kicksideai/providers/compare/kb10-v0.2.30...kb10-v0.2.31) (2026-11-19)


### Bug Fixes

* **kb10:** retry a rejected embedding provider instead of invalidating the source ([#178](https://github.com/kicksideai/providers/issues/178)) ([522d1f5](https://github.com/kicksideai/providers/commit/522d1f52c335f196dd5ef192be623afbbd48c066))

## [0.2.30](https://github.com/kicksideai/providers/compare/kb10-v0.2.29...kb10-v0.2.30) (2026-11-19)


### Bug Fixes

* **kb10:** compare upload publication when materializing deletes ([#175](https://github.com/kicksideai/providers/issues/175)) ([5d42e1f](https://github.com/kicksideai/providers/commit/5d42e1f1d4355e9940a8062d88e2dc60f3a920ca))

## [0.2.29](https://github.com/kicksideai/providers/compare/kb10-v0.2.28...kb10-v0.2.29) (2026-11-19)


### Bug Fixes

* **kb10:** retry individual files in Knowledge uploads ([#171](https://github.com/kicksideai/providers/issues/171)) ([e675d08](https://github.com/kicksideai/providers/commit/e675d0871b1f993cbd0417ddc02ce62cb6afad7f))

## [0.2.28](https://github.com/kicksideai/providers/compare/kb10-v0.2.27...kb10-v0.2.28) (2026-11-19)


### Bug Fixes

* **kb10:** retain queued sources through dependency outages ([#168](https://github.com/kicksideai/providers/issues/168)) ([e9b5476](https://github.com/kicksideai/providers/commit/e9b5476bc134528c28e069d5accc9ddbebbda7b1))

## [0.2.27](https://github.com/kicksideai/providers/compare/kb10-v0.2.26...kb10-v0.2.27) (2026-11-19)


### Bug Fixes

* **kb10:** serve complete owned store statistics ([#166](https://github.com/kicksideai/providers/issues/166)) ([a99d910](https://github.com/kicksideai/providers/commit/a99d910eb07c94254d37a2e0e803117f2ebbd809))

## [0.2.26](https://github.com/kicksideai/providers/compare/kb10-v0.2.25...kb10-v0.2.26) (2026-11-19)


### Bug Fixes

* **kb10:** count committed document populations from the store ([#164](https://github.com/kicksideai/providers/issues/164)) ([f52abd2](https://github.com/kicksideai/providers/commit/f52abd2a552ec21e99efae71ad60525c110e3c50))

## [0.2.25](https://github.com/kicksideai/providers/compare/kb10-v0.2.24...kb10-v0.2.25) (2026-11-19)


### Features

* **kb10:** offer re-ingest for selected uploads ([#157](https://github.com/kicksideai/providers/issues/157)) ([6a3ed0e](https://github.com/kicksideai/providers/commit/6a3ed0e74cf383be648baad1b8aa9f581b1133e6))

## [0.2.24](https://github.com/kicksideai/providers/compare/kb10-v0.2.23...kb10-v0.2.24) (2026-11-19)


### Bug Fixes

* **kb10:** read browse pages and totals in one snapshot ([#155](https://github.com/kicksideai/providers/issues/155)) ([fded628](https://github.com/kicksideai/providers/commit/fded628e484b503d20c3a557ac29dbf820b8d040))

## [0.2.23](https://github.com/kicksideai/providers/compare/kb10-v0.2.22...kb10-v0.2.23) (2026-11-19)


### Performance Improvements

* **kb10:** bound and resume spreadsheet planning ([1f5a249](https://github.com/kicksideai/providers/commit/1f5a249750abaf41adb3c6d38f2fed9bc1dff774))

## [0.2.22](https://github.com/kicksideai/providers/compare/kb10-v0.2.21...kb10-v0.2.22) (2026-11-19)


### Features

* **kb10:** commit source checkpoint outcomes atomically ([#150](https://github.com/kicksideai/providers/issues/150)) ([e12ab60](https://github.com/kicksideai/providers/commit/e12ab60060e3ccf868e61da393680a5342c810e9))


### Bug Fixes

* **kb10:** isolate metadata by projection target ([0cc4483](https://github.com/kicksideai/providers/commit/0cc4483cbcc06f361bc12f98704fa2b088a85739))
* **kb10:** narrow the optional HyDE model before querying ([0257949](https://github.com/kicksideai/providers/commit/02579497994c778c913f1e63f73efc9ed639d3cb))
* **kb10:** scope metadata and digest to the projection target ([9f5e8e7](https://github.com/kicksideai/providers/commit/9f5e8e7b5531d5f9011f4f470bb69fb1bf56fef4))

## [0.2.21](https://github.com/kicksideai/providers/compare/kb10-v0.2.20...kb10-v0.2.21) (2026-11-19)


### Features

* **kb10:** checkpoint canonical source ingestion ([#147](https://github.com/kicksideai/providers/issues/147)) ([bca2b2d](https://github.com/kicksideai/providers/commit/bca2b2dec7ac3763e8d15128fd154c885159e061))

## [0.2.20](https://github.com/kicksideai/providers/compare/kb10-v0.2.19...kb10-v0.2.20) (2026-11-19)


### Features

* **kb10:** show indexing progress on the knowledge base page ([#130](https://github.com/kicksideai/providers/issues/130)) ([1d0f167](https://github.com/kicksideai/providers/commit/1d0f167a7b77fcdd2ab12971975d70ced72d7bda))

## [0.2.19](https://github.com/kicksideai/providers/compare/kb10-v0.2.18...kb10-v0.2.19) (2026-11-19)


### Bug Fixes

* **kb10:** accept documents with long internal whitespace ([#132](https://github.com/kicksideai/providers/issues/132)) ([69f0007](https://github.com/kicksideai/providers/commit/69f000781ceb56acd802b11a619d6b9f22de90ba))
* **kb10:** keep contextual embedding off after saving ([10b5d79](https://github.com/kicksideai/providers/commit/10b5d796414daf366a866eb0ef2dc7b58af6e7b8))
* **kb10:** keep contextual embedding off after saving ([#131](https://github.com/kicksideai/providers/issues/131)) ([10b5d79](https://github.com/kicksideai/providers/commit/10b5d796414daf366a866eb0ef2dc7b58af6e7b8))
* **kb10:** show query results in the Ask panel ([#133](https://github.com/kicksideai/providers/issues/133)) ([70efa23](https://github.com/kicksideai/providers/commit/70efa236082d8cc53da077a9dfb8caa2bc602c91))

## [0.2.18](https://github.com/kicksideai/providers/compare/kb10-v0.2.17...kb10-v0.2.18) (2026-11-19)


### Bug Fixes

* **kb10:** keep document deletion separate from selection ([#145](https://github.com/kicksideai/providers/issues/145)) ([ea2e37b](https://github.com/kicksideai/providers/commit/ea2e37bcc02e128cf2f476da4d4952216de1f8a1))
* **kb10:** preserve document addresses and scope source bindings ([#137](https://github.com/kicksideai/providers/issues/137)) ([decb36e](https://github.com/kicksideai/providers/commit/decb36e93c1fbcc956f025be30dd8cc4781ba1b1))
* **kb10:** resolve replacement scope from document lineage ([#144](https://github.com/kicksideai/providers/issues/144)) ([a853a9c](https://github.com/kicksideai/providers/commit/a853a9c9fcde539f52c3774ffd6a1a16da8f7d41))

## [0.2.17](https://github.com/kicksideai/providers/compare/kb10-v0.2.16...kb10-v0.2.17) (2026-11-18)


### Bug Fixes

* **kb10:** admit owning secret operations without caller key access ([#110](https://github.com/kicksideai/providers/issues/110)) ([b46393b](https://github.com/kicksideai/providers/commit/b46393b1b03500aad9b1f886fe42b5dbc60bc107))

## [0.2.16](https://github.com/kicksideai/providers/compare/kb10-v0.2.15...kb10-v0.2.16) (2026-11-17)


### Bug Fixes

* preserve web component host contracts and eager bundles ([#73](https://github.com/kicksideai/providers/issues/73)) ([1a81d7c](https://github.com/kicksideai/providers/commit/1a81d7cfc40dc9b85e44705f3cf0e5ae4acde29a))

## [0.2.15](https://github.com/kicksideai/providers/compare/kb10-v0.2.14...kb10-v0.2.15) (2026-11-12)


### Bug Fixes

* **kb10:** keep search available without an assigned analysis model ([#99](https://github.com/kicksideai/providers/issues/99)) ([a1b019c](https://github.com/kicksideai/providers/commit/a1b019cd2de3fad2969b916a6c7b8e6f25649b55))

## [0.2.14](https://github.com/kicksideai/providers/compare/kb10-v0.2.13...kb10-v0.2.14) (2026-11-10)


### Bug Fixes

* **kb10:** enable grounded answers for new knowledge bases ([#82](https://github.com/kicksideai/providers/issues/82)) ([aa443b3](https://github.com/kicksideai/providers/commit/aa443b34a78e2bc5c8749e8c7ba4f4ca7d64f8db))
* **kb10:** remove test files added outside the module's suite ([#92](https://github.com/kicksideai/providers/issues/92)) ([e4149e1](https://github.com/kicksideai/providers/commit/e4149e1637a1f139eae2e2bbef84980958548b8f))

## [0.2.13](https://github.com/kicksideai/providers/compare/kb10-v0.2.12...kb10-v0.2.13) (2026-11-10)


### Bug Fixes

* **kb10:** index retrieval nodes without indexing source bodies ([#83](https://github.com/kicksideai/providers/issues/83)) ([5fa877c](https://github.com/kicksideai/providers/commit/5fa877c4d8f87e7cfd871f333c8a0b1845987fe9))

## [0.2.12](https://github.com/kicksideai/providers/compare/kb10-v0.2.11...kb10-v0.2.12) (2026-11-09)


### Bug Fixes

* **providers:** clarify knowledge search and Atlassian picker controls ([#80](https://github.com/kicksideai/providers/issues/80)) ([e610bea](https://github.com/kicksideai/providers/commit/e610bea71e9ee30baf719d7797ccfa4d7001e037))

## [0.2.11](https://github.com/kicksideai/providers/compare/kb10-v0.2.10...kb10-v0.2.11) (2026-11-08)


### Bug Fixes

* **kb10:** render each knowledge base setting once in the create dialog ([#75](https://github.com/kicksideai/providers/issues/75)) ([ff0848e](https://github.com/kicksideai/providers/commit/ff0848ee38ab66bc0b3cadf3dfeab64bc9727940))

## [0.2.10](https://github.com/kicksideai/providers/compare/kb10-v0.2.9...kb10-v0.2.10) (2026-11-06)


### Features

* **memory:** typed long-term memory configured by the Memory trait ([#53](https://github.com/kicksideai/providers/issues/53)) ([9e5d646](https://github.com/kicksideai/providers/commit/9e5d6468593148ab57ae1b7bfe856b518aaec16f))

## [0.2.9](https://github.com/kicksideai/providers/compare/kb10-v0.2.8...kb10-v0.2.9) (2026-10-27)


### Features

* **kb10:** page and slide locators on document chunks ([d37d276](https://github.com/kicksideai/providers/commit/d37d27648e6a9b3df28c3abb7dac4bc93b242d26))
* **kb10:** page and slide locators on document chunks ([2feca6f](https://github.com/kicksideai/providers/commit/2feca6f013ba41d2ee1f23575b63ef8ff1c1f0b1))


### Bug Fixes

* **kb10:** use storage-aware URLs for original documents ([#49](https://github.com/kicksideai/providers/issues/49)) ([8123ab3](https://github.com/kicksideai/providers/commit/8123ab3e966e70457b43160286fc7a96269e8568))

## [0.2.8](https://github.com/kicksideai/providers/compare/kb10-v0.2.7...kb10-v0.2.8) (2026-10-23)


### Bug Fixes

* **kb10:** bound document analysis strategies ([#39](https://github.com/kicksideai/providers/issues/39)) ([08d91c1](https://github.com/kicksideai/providers/commit/08d91c12f6f5df58acfb359414651c91f17e16ce))

## [0.2.7](https://github.com/kicksideai/providers/compare/kb10-v0.2.6...kb10-v0.2.7) (2026-10-23)


### Bug Fixes

* **kb10:** align engine query configuration declarations ([1025025](https://github.com/kicksideai/providers/commit/1025025106d5938a3beedfee20854a5e49a9d99c))
* **kb10:** consume owner upload status notifications ([48cc24f](https://github.com/kicksideai/providers/commit/48cc24f525b37ed23d6349cf8da7e62bea7ad59f))
* **kb10:** read omitted content from its artifact ([#20](https://github.com/kicksideai/providers/issues/20)) ([2947dc9](https://github.com/kicksideai/providers/commit/2947dc9a881d2e0b6a88cb6eeaf6ee5f7b7f2097))
* **kb10:** report failed resummarization work ([8963413](https://github.com/kicksideai/providers/commit/896341365be353d44baeb3dfbecaa4d874eaec97))
* **kb10:** return errors for missing deletion identities ([f3ab687](https://github.com/kicksideai/providers/commit/f3ab6873d7e396a315e587c0b5be60c51fc8846d))

## 0.2.6 (2026-10-17)

- Refresh packaged module descriptions and documentation.

## 0.2.2 (2026-10-09)

- Shows the Ask controls only when the knowledge base can answer; the query function no longer shadows the answer capability (c9a7a595).

## 0.2.1 (2026-10-08)

- Preserve retrieval observations and tuning state when installing or updating the knowledge-base schema.

## 0.2.0 (2026-10-08)

- fix(kb10): document analysis admits only the identities of the summaries it was shown (7c123443)
- fix: preserve native result bounds and refresh selected model limits (b9dc370d)
- fix: bound agent tool results and derive model checkpoint budgets (ff050198)
- fix(kb10): HyDE and embedding model failures surface as classified errors through the shared model_failure library (71c821ba)
- fix(kb10): model call failures in query ranking surface as an unavailable upstream (ba3d8c8f)
- chore: refresh locks to latest published dependencies (8f6ec35e)
- fix: bind Security in provider hosts and inspect supplied configs (88d42b29)
- build: rebuild bundles from source (1696370e)
- chore: refresh locks to latest published dependencies (61715074)
- Add selectable module access policies and native scope tests (5ae4742d)
- fix(kb10): resolve Knowledge through the latest Hub version (49b3a46f)
- Preserve typed KB lifecycle cleanup errors and resume fenced stores (4fdb14ca)
- test: declare local siblings and refresh provider harness dependencies (38657c34)
- fix(kb10): preserve UTF-8 across bounded retrieval text (4dba7c10)
- feat(kb10): declare default-off HyDE and bounded retrieval tuning (136b42c6)
- Reuse parser context and batch document persistence (7645cd6c)
- Resolve KB maintenance status by queue identity and resource (155bf5f2)
- Declare KB maintenance triggers and propagate export directory errors (4f73b0fd)
- fix(release): retain published provider snapshot metadata and locks (b70f940e)
- fix(kb10): import reports an unreadable store part instead of indexing a failed read (77630717)
- fix(kb10): return portable store read errors and prove maintenance wiring (7823312d)

## 0.1.49

Current published Hub version.

## 0.1.47

Current published Hub version.
