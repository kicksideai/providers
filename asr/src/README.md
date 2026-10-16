# kickside.asr

Speech transcription for audio uploads, as a pipeline stage.

- `stage`: the universal `upload.stage`. Self-gates on the `audio/` mime family,
  reads the stored bytes, and replaces the upload's primary content with the
  transcript.
- `transcriber`: the contract the deployment binds. Bytes and a mime in, text
  out; the binding must be marked `default: true`, because the stage opens the
  contract without naming an implementation.

With no binding installed the stage is a no-op and the upload is unchanged.
