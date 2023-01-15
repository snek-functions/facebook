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
  media: Media[]
}

/**
 * Interface for media in a Facebook post attachment.
 */
export interface Media {
  src: string
  type: string
}

/**
 * Interface for a blocklist of post IDs.
 */
export interface Blocklist {
  ids: string[]
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
