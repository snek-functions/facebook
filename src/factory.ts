import {makeFn} from '@snek-at/functions'

export const url = process.env.IS_OFFLINE
  ? process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-4040.githubpreview.dev/graphql`
    : 'http://localhost:4040/graphql'
  : `${process.env.ENDPOINT_URL_EMAIL}`

export const fn = makeFn({
  url
})

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
