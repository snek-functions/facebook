import {Facebook} from 'fb'
import {FacebookApiError, InvalidArgumentError} from './errors'
import {Blocklist, Post} from './interfaces'

/**
 * Fetches the posts from the specified Facebook page, filtered by the specified blocklist.
 * Posts whose ID is contained in the blocklist will be removed from the results.
 * @param pageId The ID of the Facebook page to fetch posts from.
 * @param accessToken The access token to use for the Facebook API.
 * @param blocklist The blocklist to filter the posts by.
 * @returns The fetched posts.
 */
export async function fetchPosts(
  pageId: string,
  accessToken: string,
  blocklist?: Blocklist
): Promise<Post[]> {
  try {
    if (!pageId) {
      throw new InvalidArgumentError('Page ID is required to fetch posts')
    }
    if (!accessToken) {
      throw new InvalidArgumentError('Access token is required to fetch posts')
    }
    // Fetch posts from Facebook page
    const fb = new Facebook({version: 'v15.0'})
    fb.setAccessToken(accessToken)
    let posts: Post[] = []
    try {
      const response = await fb.api(
        `/${pageId}/posts?fields=id,message,attachments`
      )
      if (response.error) {
        throw new FacebookApiError(response.error.message)
      }
      posts = response.data.filter(
        (post: Post) => !blocklist?.ids.includes(post.id)
      )
    } catch (err) {
      if (err instanceof FacebookApiError) {
        const errorMessage = `Error fetching posts from page ${pageId}: ${err.message}`
        console.error(errorMessage)
        throw new FacebookApiError(errorMessage)
      }
    }
    // Fetch attachments for each post
    for (const post of posts) {
      try {
        const attachmentsResponse = await fb.api(`/${post.id}/attachments`)
        if (attachmentsResponse.error) {
          throw new FacebookApiError(attachmentsResponse.error.message)
        }
        post.attachments = attachmentsResponse.data
      } catch (err) {
        if (err instanceof FacebookApiError) {
          const errorMessage = `Error fetching attachments for post with ID ${post.id}: ${err.message}`
          console.error(errorMessage)
          throw new FacebookApiError(errorMessage)
        }
      }
    }
    return posts
  } catch (err) {
    if (err instanceof Error) {
      const errorMessage = `Error fetching posts from page ${pageId}: ${err.message}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    } else {
      const errorMessage = `Error fetching posts from page ${pageId}: Error is not an instance of Error: ${err}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
