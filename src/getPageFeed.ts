import {fn} from './factory'
import {loadBlocklist} from './internal/blocklist'
import {fetchPosts} from './internal/fetch'
import {Blocklist} from './internal/interfaces'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN'
const BLOCKLIST_PATH = process.env.PAGE_ID || 'path/to/blocklist.parquet'

const getPageFeed = fn<{pageId: string}, string>(
  async (args, _, {req, res}) => {
    // Call the loadBlocklist function and pass in the blocklist path
    const blocklist: Blocklist = await loadBlocklist(BLOCKLIST_PATH)

    // Call the fetchPosts function and pass in the access token, page id, and blocklist
    const posts = await fetchPosts(ACCESS_TOKEN, args.pageId, blocklist)
    // Log the returned posts
    console.log(posts)

    return JSON.stringify(posts)
  },
  {
    name: 'getPageFeed',
    decorators: []
  }
)

export default getPageFeed

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
