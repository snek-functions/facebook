import {spawnChild} from '../factory.js'
import {FacebookApiError, InvalidArgumentError} from './errors.js'
import {Attachment, Blocklist, Media, Post} from './interfaces.js'

// Define API endpoints
const baseUrl = 'https://graph.facebook.com/v15.0/'
const postsEndpoint = `${baseUrl}/{pageId}/posts?fields=id,message,permalink_url&limit=10`
const attachmentsEndpoint = `${baseUrl}/{postId}/attachments?fields=media_type,media,type,url,target`
const albumEndpoint = `${baseUrl}/{albumId}/photos?fields=images`

let lastfetch: Date | undefined

/**
 * Fetches all posts from a Facebook page and returns an array of posts. Posts whose id is contained in the blocklist will be removed from the results.
 * @param {string} accessToken - Access token to use for the Facebook API.
 * @param {string} pageId - The id of the Facebook page to fetch posts from.
 * @param {number} limit - The id of the Facebook page to fetch posts from.
 * @param {Blocklist} [blocklist] - An optional blocklist of post ids to exclude from the results.
 * @returns {Promise<Post[]>} - A promise that resolves to an array of posts.
 */
export async function fetchPosts(
  accessToken: string,
  pageId: string,
  blocklist?: Blocklist,
  limit: number = 10
): Promise<Post[]> {
  if (!accessToken) {
    throw new InvalidArgumentError(
      'Invalid argument: accessToken. The access token argument is required and cannot be empty or null. To obtain a Facebook access token, visit the Facebook Developer website (https://developers.facebook.com/) and create a new app.'
    )
  }
  if (!pageId) {
    throw new InvalidArgumentError(
      'Invalid argument: pageId. The pageId argument is required and cannot be empty or null. To find a Facebook page id, go to the desired page and look for the id in the url or use the Graph API Explorer (https://developers.facebook.com/tools/explorer/) to find the id by searching for the page name.'
    )
  }

  // Load posts from a parquet file
  let posts = JSON.parse(
    await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
      'retrieve',
      '/var/duckdb/_posts.parquet'
    ])
  )

  const now = new Date()
  // If posts are empty, fetch posts from Facebook
  if (
    posts.length === 0 ||
    lastfetch === undefined ||
    now.getTime() - lastfetch.getTime() > 3600000
  ) {
    lastfetch = now

    try {
      // Fetch all posts from the specified Facebook page
      const response = await fetch(postsEndpoint.replace('{pageId}', pageId), {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Check for errors in the response
      if (!response.ok) {
        throw new FacebookApiError(await response.text())
      }

      // Parse the response as JSON
      const json = await response.json()

      // Extract the posts from the JSON
      posts = json.data.map((post: any) => {
        return {
          id: post.id,
          link: post.permalink_url,
          page: pageId,
          message: post.message,
          blocked: false
        }
      })

      // Fetch attachments for each post
      for (const post of posts) {
        post.attachments = await fetchAttachments(accessToken, post.id)
      }

      // Dump the posts to a parquet file
      await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
        'dump',
        '/var/duckdb/_posts.parquet',
        JSON.stringify(posts)
      ])
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

  // Filter out the posts that are on the blocklist (if provided)
  if (blocklist) {
    console.log(posts)
    // Mark out posts that are on the blocklist
    posts = posts.map((post: Post) => {
      if (blocklist.find(blockedPost => blockedPost.postId === post.id)) {
        post.blocked = true
      }
      return post
    })
  }
  // Reduce to 5 posts
  posts = posts.slice(0, limit)

  return posts
}

/**
 * Fetche all attachments of a specific post id
 * @param accessToken - A valid Facebook access token
 * @param postId - The id of the post to fetch attachments for
 * @returns A promise that resolves to an array of Attachment objects, or rejects with an error
 */
async function fetchAttachments(
  accessToken: string,
  postId: string
): Promise<Attachment[]> {
  // This function is used to fetch the attachments (such as photos or videos) for a specific postId
  // It takes in an accessToken and a postId as parameters and returns an array of Attachment objects

  try {
    // Fetch all attachments from the specified Facebook post
    const attachmentsResponse = await fetch(
      attachmentsEndpoint.replace('{postId}', postId),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    const attachmentsData = await attachmentsResponse.json()
    let attachments: Attachment[] = []

    if (attachmentsData.data instanceof Array) {
      attachments = await Promise.all(
        attachmentsData.data.map(async (attachment: any) => {
          let media: Media = {src: []} as Media

          if (attachment.type === 'photo') {
            // We only want to fetch photos for now
            media = {
              src: [...media.src, attachment.media.image.src]
            } as Media
          }
          if (attachment.type === 'album') {
            try {
              // Fetch all photos in the album
              const albumResponse = await fetch(
                albumEndpoint.replace('{albumId}', attachment.target.id),
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
              )
              // We only want to fetch photos for now
              media = {
                src: [...media.src, attachment.media.image.src]
              } as Media
            } catch (err) {
              if (err instanceof Error) {
                const errorMessage = `Error fetching attachments for post ${postId}: ${err.message}`
                console.error(errorMessage)
                throw new Error(errorMessage)
              } else {
                const errorMessage = `Error fetching attachments for post ${postId}: Error is not an instance of Error: ${err}`
                console.error(errorMessage)
                throw new Error(errorMessage)
              }
            }
          }

          return {
            id: attachment.id,
            type: attachment.type,
            url: attachment.url,
            src: media.src
          } as Attachment
        })
      )
    }

    return attachments
  } catch (err) {
    if (err instanceof Error) {
      const errorMessage = `Error fetching attachment from post ${postId}: ${err.message}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    } else {
      const errorMessage = `Error fetching attachment from post ${postId}: Error is not an instance of Error: ${err}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
}
