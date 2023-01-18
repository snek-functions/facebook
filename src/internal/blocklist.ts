//import {createFile, readFile} from 'parquetjs'
import {spawnChild} from '../factory.js'
import {Blocklist} from './interfaces'

/**
 * Loads the blocklist from the specified file path using Parquet.
 * If the file does not exist, a new blocklist with an empty ids array will be created.
 * @param blocklistPath The file path of the blocklist to load.
 * @returns The loaded blocklist.
 */
export async function loadBlocklist(blocklistPath: string): Promise<Blocklist> {
  try {
    if (!blocklistPath) {
      throw new Error('Blocklist path is required to load blocklist')
    }
    // Create new blocklist parquet
    let blocklist: Blocklist = []

    // Load blocklist parquet
    blocklist = JSON.parse(
      await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
        'retrieve',
        blocklistPath
      ])
    )

    return blocklist
  } catch (err) {
    if (err instanceof Error) {
      const errorMessage = `Error loading blocklist from ${blocklistPath}: ${err.message}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    } else {
      const errorMessage = `Error loading blocklist from ${blocklistPath}: Error is not an instance of Error: ${err}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
}

/**
 * Adds a post ID to the specified blocklist.
 * @param postId The post ID to add to the blocklist.
 * @param blocklist The blocklist to add the post ID to.
 * @returns The updated blocklist.
 */
export async function addToBlocklist(
  postId: string,
  blocklist: Blocklist
): Promise<Blocklist> {
  try {
    if (!postId) {
      throw new Error('Post ID is required to add to blocklist')
    }
    if (!blocklist) {
      throw new Error('Blocklist is required to add to blocklist')
    }
    // Add post ID to blocklist
    blocklist.push({postId: postId})
    return blocklist
  } catch (err) {
    if (err instanceof Error) {
      const errorMessage = `Error adding post with ID ${postId} to blocklist: ${err.message}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    } else {
      const errorMessage = `Error adding post with ID ${postId} to blocklist: Error is not an instance of Error: ${err}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
}

/**
 * Removes a post ID from the specified blocklist.
 * @param postId The post ID to remove from the blocklist.
 * @param blocklist The blocklist to remove the post ID from.
 * @returns The updated blocklist.
 */
export async function removeIdFromBlocklist(
  postId: string,
  blocklist: Blocklist
): Promise<Blocklist> {
  try {
    if (!postId) {
      throw new Error('Post ID is required to remove from blocklist')
    }
    if (!blocklist) {
      throw new Error('Blocklist is required to remove from blocklist')
    }
    // Remove post ID from blocklist
    blocklist = blocklist.filter(item => item.postId !== postId)
    return blocklist
  } catch (err) {
    if (err instanceof Error) {
      const errorMessage = `Error removing post with ID ${postId} from blocklist: ${err.message}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    } else {
      const errorMessage = `Error removing post with ID ${postId} from blocklist: Error is not an instance of Error: ${err}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
}

/**
 * Saves the specified blocklist to the specified file path using Parquet.
 * @param blocklist The blocklist to save.
 * @param blocklistPath The file path to save the blocklist to.
 */
export async function saveBlocklist(
  blocklist: Blocklist,
  blocklistPath: string
): Promise<void> {
  try {
    if (!blocklist) {
      throw new Error('Blocklist is required to save blocklist')
    }
    if (!blocklistPath) {
      throw new Error('Blocklist path is required to save blocklist')
    }

    await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
      'dump',
      blocklistPath,
      JSON.stringify(blocklist)
    ])
  } catch (err) {
    if (err instanceof Error) {
      const errorMessage = `Error saving blocklist to ${blocklistPath}: ${err.message}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    } else {
      const errorMessage = `Error saving blocklist to ${blocklistPath}: Error is not an instance of Error: ${err}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
  }
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
