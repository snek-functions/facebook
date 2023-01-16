import { Attachment, Media, Post, Blocklist } from "./interfaces.js";
import { FacebookApiError, InvalidArgumentError } from "./errors.js";

// Define API endpoints
const baseUrl = "https://graph.facebook.com/v15.0/";
const postsEndpoint = `${baseUrl}/{pageId}/posts?fields=message,permalink_url`;
const attachmentsEndpoint = `${baseUrl}/{postId}/attachments?fields=media_type,media,type,url`;

/**
 * Fetches all posts from a Facebook page and returns an array of posts. Posts whose id is contained in the blocklist will be removed from the results.
 * @param {string} accessToken - Access token to use for the Facebook API.
 * @param {string} pageId - The id of the Facebook page to fetch posts from.
 * @param {Blocklist} [blocklist] - An optional blocklist of post ids to exclude from the results.
 * @returns {Promise<Post[]>} - A promise that resolves to an array of posts.
 */
export async function fetchPosts(
  accessToken: string,
  pageId: string,
  blocklist?: Blocklist
): Promise<Post[]> {
  if (!accessToken) {
    throw new InvalidArgumentError(
      "Invalid argument: accessToken. The access token argument is required and cannot be empty or null. To obtain a Facebook access token, visit the Facebook Developer website (https://developers.facebook.com/) and create a new app."
    );
  }
  if (!pageId) {
    throw new InvalidArgumentError(
      "Invalid argument: pageId. The pageId argument is required and cannot be empty or null. To find a Facebook page id, go to the desired page and look for the id in the url or use the Graph API Explorer (https://developers.facebook.com/tools/explorer/) to find the id by searching for the page name."
    );
  }

  try {
    // Fetch all posts from the specified Facebook page
    const response = await fetch(postsEndpoint.replace("{pageId}", pageId), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Check for errors in the response
    if (!response.ok) {
      throw new FacebookApiError(await response.text());
    }

    // Parse the response as JSON
    const json = await response.json();

    // Extract the posts from the JSON
    let posts = json.data as Post[];

    // Filter out the posts that are on the blocklist (if provided)
    if (blocklist) {
      posts = posts.filter((post) => !blocklist.ids.includes(post.id));
    }

    // Fetch attachments for each post
    for (const post of posts) {
      post.attachments = await fetchAttachments(accessToken, post.id);
    }

    return posts;
  } catch (err) {
    if (err instanceof Error) {
      const errorMessage = `Error fetching posts from page ${pageId}: ${err.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    } else {
      const errorMessage = `Error fetching posts from page ${pageId}: Error is not an instance of Error: ${err}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
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
      attachmentsEndpoint.replace("{postId}", postId),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const attachmentsData = await attachmentsResponse.json();
    let attachments: Attachment[] = [];

    if (attachmentsData.data instanceof Array) {
      attachments = attachmentsData.data.map((attachment: any) => {
        let media: Media = {} as Media;
        if (attachment.type === "photo") {
          // We only want to fetch photos for now
          media = {
            image: {
              height: attachment.media.image.height,
              width: attachment.media.image.width,
              src: attachment.media.image.src,
            }
          } as Media
        }

        return {
          id: attachment.id,
          type: attachment.type,
          url: attachment.url,
          title: attachment.title,
          media,
        } as Attachment;
      });
    }

    return attachments;
  } catch (err) {
    if (err instanceof Error) {
      const errorMessage = `Error fetching attachment from post ${postId}: ${err.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    } else {
      const errorMessage = `Error fetching attachment from post ${postId}: Error is not an instance of Error: ${err}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
