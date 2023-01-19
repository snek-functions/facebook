import cors from 'cors'
import express from 'express'

import {ConfigureApp} from '@snek-at/functions'
import getServerlessApp from '@snek-at/functions/dist/server/getServerlessApp.js'

export const configureApp: ConfigureApp = app => {
  app.use((req, res, next) => {
    return cors({
      origin: true,
      credentials: true
    })(req, res, next)
  })

  app.use(express.urlencoded())
}

export async function handler(event: Object, context: Object) {
  return await getServerlessApp({
    functions: '.'
  })(event, context)
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
