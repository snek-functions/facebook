import {fn, spawnChild} from './factory'
import {loadBlocklist} from './internal/blocklist.js'
import {fetchPosts} from './internal/fetch.js'
import {Blocklist, Post} from './internal/interfaces.js'

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '<ACCESS_TOKEN>'
const BLOCKLIST_PATH =
  process.env.BLOCKLIST_PATH || '/var/duckdb/_blacklist.parquet'

const getPageFeed = fn<
  {pageId: string; kId: string; kPassword: string},
  Post[]
>(
  async (args, _, {req, res}) => {
    // Check if user.parquet file exists and if not, create it
    const fs = await import('fs')
    if (!fs.existsSync(BLOCKLIST_PATH)) {
      const defaultBlocklist = [
        {
          postId: '1234567890'
        }
      ]

      await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
        'dump',
        BLOCKLIST_PATH,
        JSON.stringify(defaultBlocklist)
      ])
    }

    // Call the loadBlocklist function and pass in the blocklist path
    let blocklist: Blocklist = await loadBlocklist(BLOCKLIST_PATH)
    // Call the fetchPosts function and pass in the access token, page id, and blocklist
    let posts = await fetchPosts(ACCESS_TOKEN, args.pageId, blocklist, 5)
    // Filter out posts that are on the blocklist
    posts = posts.filter((post: Post) => {
      return post.blocked !== true
    })
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
