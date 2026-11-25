-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
type ErrorResponse = {name: string}
type Attachment = {filename: string, content_type: string, content: string, content_id: string?}

return {ErrorResponse = ErrorResponse, Attachment = Attachment}
