# kickside/llm-ocr

Model-based transcription of rendered document pages and raster image uploads.

This module installs independently into a [KickSide](https://kickside.ai) host.

## Quick start

In **System → Modules**, select the package from the Wippy Hub and review its
requirements. For CLI dependency setup, run from the host application directory:

```sh
wippy add kickside/llm-ocr
wippy install
```

Apply host bindings and migrations through the application install plan.
Select the OCR model in the module settings. Rendered upload pages and stored raster image artifacts supply the images; the model provider supplies credentials.
Image OCR is enabled by default. It creates primary Markdown text and retains the original image artifact for preview and vision. Set `ocr_images` to false to keep image uploads source-only; `ocr_enabled` disables all OCR. SVG uploads remain source-only.

Embedded images in a text-bearing Office document remain figures. OCR preserves the
converter's primary body text even when the body is short. Empty Office documents and
sparse PDF page scans use the page-image transcription path.

## Key concepts

See [src/](src/) for registry declarations and implementation.

## Requirements

Wippy 0.3.x; repository validation uses 0.3.47a. Use current Hub dependencies
for the contracts declared by the module.
The standalone harness uses SQLite and declares a PostgreSQL test profile.
Development uses Make and the Wippy CLI.

## Development

From this module directory:

```sh
cd test
wippy install
cd ..
make lint
make test
cd test
wippy test --profile postgres --set vars.pg_database=kickside_readme_test
```

Create a dedicated PostgreSQL database before the profile run and drop it
afterward. Set the `pg_host`, `pg_port`, `pg_username`, and `pg_password`
variables in the harness configuration for your test server.

## Links

- [KickSide](https://kickside.ai)
- [Module authoring](https://kicksideai.github.io/docs/building-modules/)
- [Wippy documentation](https://wippy.ai)
- [Wippy Hub](https://hub.wippy.ai/kickside/llm-ocr)

## License

[KickSide Community License 1.0](LICENSE). Vendored dependencies retain their own licenses.
