import {fn} from './factory'
import {loadBlocklist} from './internal/blocklist.js'
import {fetchPosts} from './internal/fetch.js'
import {Blocklist, Post} from './internal/interfaces.js'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '<ACCESS_TOKEN>'
const BLOCKLIST_PATH =
  process.env.BLOCKLIST_PATH || '/var/duckdb/_blacklist.parquet'

const managePageFeed = fn<{pageId: string; token: string}, Post[]>(
  async (args, _, {req, res}) => {
    const {verify} = await import('./internal/toolbox/token/factory.js')
    if (verify(args.token)) {
      // Call the loadBlocklist function and pass in the blocklist path
      let blocklist: Blocklist = await loadBlocklist(BLOCKLIST_PATH)
      // Call the fetchPosts function and pass in the access token, page id, and blocklist
      const posts = await fetchPosts(ACCESS_TOKEN, args.pageId, blocklist)
      // If post id in blocklist, set blocked to true

      // Log the returned posts
      console.log(posts)

      return posts
    } else {
      throw new Error('Invalid credentials')
    }
  },
  {
    name: 'managePageFeed',
    decorators: []
  }
)

export default managePageFeed

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
