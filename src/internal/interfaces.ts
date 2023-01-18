/**
 * Interface for a Facebook post.
 */
export interface Post {
  id: string
  link: string
  page: string
  message: string
  blocked: boolean
  attachments?: Attachment[]
}

/**
 * Interface for a Facebook post attachment.
 */
export interface Attachment {
  type: string
  src: string[]
}

/**
 * Interface for media in a Facebook post attachment.
 */
export interface Media {
  src: string[]
}

/**
 * Interface for a blocklist of post IDs.
 */
export interface Blocklist extends Array<{postId: string}> {}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
