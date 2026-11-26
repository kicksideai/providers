-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
type ContentPart = {type: string, value: string}
type Address = {email: string}
type Attachment = {filename: string, type: string, content: string, disposition: string, content_id: string?}

return {ContentPart = ContentPart, Address = Address, Attachment = Attachment}
