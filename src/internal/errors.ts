/**
 * Custom error class for invalid arguments passed to a function.
 */
export class InvalidArgumentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidArgumentError'
  }
}

/**
 * Custom error class for errors thrown by the Facebook API.
 */
export class FacebookApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FacebookApiError'
  }
}

/**
 * Custom error class for errors thrown while reading a file.
 */
export class FileReadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileReadError'
  }
}

// SPDX-License-Identifier: (EUPL-1.2)
// Copyright © 2019-2022 snek.at
