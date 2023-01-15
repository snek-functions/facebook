import {loadBlocklist} from './blocklist'
import {fetchPosts} from './fetch'
import {Blocklist} from './interfaces'

// Set the access token, blocklist path and page id
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'
const BLOCKLIST_PATH = 'path/to/blocklist.parquet'
const PAGE_ID = 'YOUR_PAGE_ID'

async function main() {
  // Try to load the blocklist
  try {
    // Call the loadBlocklist function and pass in the blocklist path
    const blocklist: Blocklist = await loadBlocklist(BLOCKLIST_PATH)
    // Try to fetch the posts
    try {
      // Call the fetchPosts function and pass in the access token, page id, and blocklist
      const posts = await fetchPosts(ACCESS_TOKEN, PAGE_ID, blocklist)
      // Log the returned posts
      console.log(posts)
    } catch (err) {
      // Catch any errors that may occur during the fetching process
      // Log the error to the console
      console.error(err)
    }
  } catch (err) {
    // Catch any errors that may occur during the loading of the blocklist
    // Log the error to the console
    console.error(err)
  }
}

// Call the main function
main()

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
