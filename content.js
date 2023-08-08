// Retrieve the video ID from the URL
const videoId = window.location.search.split('v=')[1];

// Retrieve the comments using the YouTube Data API
fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=AIzaSyCz6XbJYOm5-P24mIjaPtMdoQNwuIGf8k4`)
  .then(response => response.json())
  .then(data => {
    // Iterate over the comments and check for spam
    data.items.forEach(item => {
      const comment = item.snippet.topLevelComment.snippet.textDisplay;
      
      // Check for spam using the Perspective API
      fetch('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=783791584968-glhu6k4h62vr9c5bf1u5gdlh86c6jj4g.apps.googleusercontent.com', 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comment: {
            text: comment
          },
          requestedAttributes: {
            SPAM: {}
          }
        })
      })
        .then(response => response.json())
        .then(data => {
          // If the comment is spam, flag it
          if (data.attributeScores.SPAM.summaryScore.value > 0.5) {
            item.snippet.topLevelComment.snippet.textDisplay += ' (SPAM)';
          }
        });
    });
  });
