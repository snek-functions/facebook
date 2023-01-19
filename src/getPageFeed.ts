import {
  ADMIN_PASSWORD,
  BLOCKLIST_PATH,
  FACEBOOK_TOKEN,
  USER_PATH
} from './constants.js'
import {fn, spawnChild} from './factory'
import {loadBlocklist} from './internal/blocklist.js'
import {fetchPosts} from './internal/fetch.js'
import {Blocklist, Post} from './internal/interfaces.js'
import {User} from './types'

const getPageFeed = fn<
  {pageId: string; kId: string; kPassword: string},
  Post[]
>(
  async (args, _, {req, res}) => {
    // Check if user.parquet file exists and if not, create it
    const fs = await import('fs')
    if (!fs.existsSync(USER_PATH)) {
      const {generatePasswordHash} = await import(
        './internal/toolbox/hash/hash.js'
      )
      const defaultUser = [
        {
          userId: '0',
          username: 'admin',
          passwordHash: await generatePasswordHash(ADMIN_PASSWORD),
          pageId: '0',
          pageToken: '',
          isAdmin: true
        } as User
      ]

      await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
        'dump',
        USER_PATH,
        JSON.stringify(defaultUser)
      ])
    }

    const userStr = await spawnChild(
      'venv/bin/python',
      'internal/toolbox/pit/pit.py',
      ['search', USER_PATH, `pageId=${args.pageId}`]
    )
    console.log(userStr)

    //const user = JSON.parse(userStr)[0] as User

    // Check if user.parquet file exists and if not, create it
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
    let posts: Post[] = await fetchPosts(
      FACEBOOK_TOKEN || JSON.parse(userStr)[0]?.pageToken,
      args.pageId,
      blocklist,
      5
    )
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
