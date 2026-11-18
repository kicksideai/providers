# KickSide Provider Text

`kickside.provider_text:trim` removes leading and trailing ASCII whitespace
(spaces and bytes 9–13). It preserves everything between the first and last
non-whitespace byte and returns an empty string for missing, non-string or
whitespace-only inputs.
