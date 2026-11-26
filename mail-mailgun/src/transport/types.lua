-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local mail = require("mail_types")

type Settings = mail.ApiSettings & {domain: string, region: string}
type Config = {key: string, url: string}

return {Settings = Settings, Config = Config}
