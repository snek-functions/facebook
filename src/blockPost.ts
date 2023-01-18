import {fn} from './factory'
import {
  addToBlocklist,
  loadBlocklist,
  saveBlocklist
} from './internal/blocklist.js'
import {Blocklist} from './internal/interfaces.js'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '<ACCESS_TOKEN>'
const BLOCKLIST_PATH = process.env.PAGE_ID || '/var/duckdb/_blacklist.parquet'

const blockPost = fn<{postId: string; token: string}, void>(
  async (args, _, {req, res}) => {
    const {verify} = await import('./internal/toolbox/token/factory.js')
    if (verify(args.token)) {
      // Call the loadBlocklist function and pass in the blocklist path
      let blocklist: Blocklist = await loadBlocklist(BLOCKLIST_PATH)
      //let blocklist = {ids: []} as Blocklist //await addToBlocklist(args.postId, blocklist)
      blocklist = await addToBlocklist(args.postId, blocklist)
      await saveBlocklist(blocklist, BLOCKLIST_PATH)

      // Log the returned posts
      console.log(args.postId)
    } else {
      throw new Error('Invalid credentials')
    }
  },
  {
    name: 'blockPost',
    decorators: []
  }
)

export default blockPost

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
