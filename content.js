// Function to extract video ID from the URL
function extractVideoIdFromUrl() {
  const queryString = window.location.search;
  const videoIdParam = 'v=';
  const startIndex = queryString.indexOf(videoIdParam);

  if (startIndex !== -1) {
    const endIndex = queryString.indexOf('&', startIndex);
    return endIndex === -1
      ? queryString.substring(startIndex + videoIdParam.length)
      : queryString.substring(startIndex + videoIdParam.length, endIndex);
  }

  return null;
}

// Function to fetch comments from the YouTube Data API
async function fetchYouTubeComments(videoId) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/commentThreads`;
  const apiKey = 'no_key'; // not uploaded for security reasons

  try {
    const response = await fetch(`${apiUrl}?part=snippet&videoId=${videoId}&key=${apiKey}`);

    if (!response.ok) {
      throw new Error('Failed to fetch comments from YouTube Data API');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching comments from YouTube Data API:', error);
    return [];
  }
}

// Function to check if a comment is spam using the Perspective API
async function checkCommentForSpam(comment) {
  const apiUrl = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';
  const apiKey = 'no_key'; // not uploaded for security reasons

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
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
    });

    if (!response.ok) {
      throw new Error('Failed to analyze comment using Perspective API');
    }

    const data = await response.json();
    return data.attributeScores.SPAM.summaryScore.value || 0;
  } catch (error) {
    console.error('Error analyzing comment using Perspective API:', error);
    return 0; // Assume not spam on error
  }
}

// Function to process and flag spam comments
async function processComments(videoId) {
  const comments = await fetchYouTubeComments(videoId);

  for (const commentItem of comments) {
    const commentText = commentItem.snippet.topLevelComment.snippet.textDisplay;
    const spamScore = await checkCommentForSpam(commentText);

    if (spamScore > 0.5) {
      commentItem.snippet.topLevelComment.snippet.textDisplay += ' (SPAM)';
    }
  }
}

// Main function to execute the comment processing
function main() {
  const videoId = extractVideoIdFromUrl();

  if (videoId) {
    processComments(videoId);
  } else {
    console.error('Invalid video ID in URL');
  }
}

// Start processing comments when the page loads
window.addEventListener('load', main);
