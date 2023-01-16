/**
 * Interface for a Facebook post.
 */
export interface Post {
  id: string
  message?: string
  link?: string
  attachments?: Attachment[]
}

/**
 * Interface for a Facebook post attachment.
 */
export interface Attachment {
  media: Media
  type: string
}

/**
 * Interface for media in a Facebook post attachment.
 */
export interface Media {
  image: {
    height: number
    width: number
    src: string
  }
}

/**
 * Interface for a blocklist of post IDs.
 */
export interface Blocklist {
  ids: string[]
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
