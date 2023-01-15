# Facebook Post Fetcher

This is a small application that fetches posts from a Facebook page, removes the ones that are in a blocklist and returns the remaining posts along with their media.

## Usage

1. Clone the repository

```bash
git clone https://github.com/your-username/facebook-post-fetcher.git
```

2. Install the dependencies

```bash
npm install
```

3. Create a blocklist.parquet file with the ids of the posts you want to block.
4. Set the environment variables:
   - `ACCESS_TOKEN`: Your Facebook access token.
   - `BLOCKLIST_PATH`: The path to your blocklist.parquet file.
   - `PAGE_ID`: The id of the Facebook page from which you want to fetch posts.
5. Run the script

```bash
npm start
```

## Using Docker

You can use Docker to run this project and pass in the required environment variables and volume.

First, build the Docker image using the following command:

```bash
docker build -t my-facebook-post-fetcher .
```

Then, run the container and pass in the environment variables and volume as follows:

```bash
docker run -e ACCESS_TOKEN=YOUR_ACCESS_TOKEN -e BLOCKLIST_PATH=path/to/blocklist.parquet -e PAGE_ID=YOUR_PAGE_ID -v path/to/blocklist.parquet:/app/path/to/blocklist.parquet my-facebook-post-fetcher
```

Please make sure to replace `YOUR_ACCESS_TOKEN`,`YOUR_PAGE_ID` and `path/to/blocklist.parquet` with your actual access token, page id and the path to your blocklist file.
You can also use a .env file to store the values of these environment variables and use it to run the container with the command `docker run --env-file .env -v path/to/blocklist.parquet:/app/path/to/blocklist.parquet my-facebook-post-fetcher`
You should now be able to see the fetched posts on the console.
