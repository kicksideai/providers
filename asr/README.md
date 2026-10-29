# kickside/asr

Speech transcription as a universal audio and video upload stage.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/asr
wippy install
```

Apply host bindings and migrations through the application install plan.
Bind the transcription contract to an installed transcriber. The upload stage consumes stored audio or video; provider credentials belong to the transcriber.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.55a. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Development uses Make and the Wippy CLI.

## Development

From this module directory:

```sh
make lockrefresh
make lint
make test
(cd test && wippy test --profile postgres --set vars.pg_database=kickside_readme_test)
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.

## Use

Install to enable the declared audio transcription stage. Configure the speech model/provider required by the stage, upload audio through Uploads, and inspect the resulting text or processing error. The stage does not add a navigation page.

## Reference

- [Module reference](src/README.md)

### Contracts

| Definition | Methods |
| --- | --- |
| [`kickside.asr:transcriber`](src/_index.yaml) | `transcribe` |

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://github.com/kicksideai/docs/blob/main/building-modules/index.md)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/asr)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
