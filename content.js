// Retrieve the video ID from the URL
const videoId = window.location.search.split('v=')[1];

// Define the YouTube Data API endpoint URL
const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/commentThreads`;

// Define the API key for YouTube Data API
const youtubeApiKey = 'YOUR_YOUTUBE_API_KEY';

// Define the Perspective API endpoint URL
const perspectiveApiUrl = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

// Define the API key for Perspective API
const perspectiveApiKey = 'YOUR_PERSPECTIVE_API_KEY';

// Function to fetch comments from the YouTube Data API
function fetchComments(videoId) {
  return fetch(`${youtubeApiUrl}?part=snippet&videoId=${videoId}&key=${youtubeApiKey}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch comments from YouTube Data API');
      }
      return response.json();
    })
    .catch(error => {
      console.error(error);
    });
}

// Function to check if a comment is spam using the Perspective API
function checkForSpam(comment) {
  return fetch(`${perspectiveApiUrl}?key=${perspectiveApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: {
        text: comment,
      },
      requestedAttributes: {
        SPAM: {},
      },
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to analyze comment using Perspective API');
      }
      return response.json();
    })
    .then(data => data.attributeScores.SPAM.summaryScore.value)
    .catch(error => {
      console.error(error);
      return 0; // Assume not spam on error
    });
}

// Function to process and flag spam comments
async function processComments(videoId) {
  try {
    const commentData = await fetchComments(videoId);

    if (commentData.items) {
      for (const item of commentData.items) {
        const comment = item.snippet.topLevelComment.snippet.textDisplay;
        const spamScore = await checkForSpam(comment);

        if (spamScore > 0.5) {
          item.snippet.topLevelComment.snippet.textDisplay += ' (SPAM)';
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// Call the function to start processing comments
processComments(videoId);
