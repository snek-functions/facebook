import {fn} from './factory'
import {loadBlocklist} from './internal/blocklist.js'
import {fetchPosts} from './internal/fetch.js'
import {Blocklist} from './internal/interfaces.js'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || 'EAAwJPVVvT54BAPqzhOsxX9EGl3WJHTX84sxYMKK0JUnvOODHsFUkcgxcBDGk4vDfv4cbjqW1ySsZAnEy4H2P4GiyI7USlZAnwNfz7BCwEQ2dn21A4piRkBl8333S4i5ZBD5NAo7GEEGxxbDwmkGEkxprkNNKd7bI98U5RC8qdTbiRkTl8CbMTrjyF1ffGegZBLyUaYEoawZDZD'
const BLOCKLIST_PATH = process.env.PAGE_ID || 'path/to/blocklist.parquet'

const getPageFeed = fn<{pageId: string}, string>(
  async (args, _, {req, res}) => {
    // Call the loadBlocklist function and pass in the blocklist path
    const blocklist: Blocklist = await loadBlocklist(BLOCKLIST_PATH)

    // Call the fetchPosts function and pass in the access token, page id, and blocklist
    const posts = await fetchPosts(ACCESS_TOKEN, args.pageId, blocklist)
    // Log the returned posts
    console.log(posts)

    return posts
  },
  {
    name: 'getPageFeed',
    decorators: []
  }
)

export default getPageFeed

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
