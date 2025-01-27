import { YoutubeTranscript } from 'youtube-transcript';
import fs from 'fs/promises';
import path from 'path';

/**
 * Fetches the transcript of a YouTube video
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Array<{text: string, duration: number, offset: number}>>}
 * @throws {Error} If transcript cannot be fetched or video ID is invalid
 */
async function getYoutubeTranscript(videoId) {
  try {
    // Validate video ID
    if (!videoId) {
      throw new Error('Video ID is required');
    }

    // Fetch transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Return the transcript array
    return transcript;

  } catch (error) {
    // Handle specific error cases
    if (error.message.includes('NOT_FOUND')) {
      throw new Error('Video not found or transcript is not available');
    }
    if (error.message.includes('FORBIDDEN')) {
      throw new Error('Access to transcript is forbidden');
    }
    
    // Throw the original error for other cases
    throw error;
  }
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube video URL
 * @returns {string|null} - Video ID or null if invalid URL
 */
function extractYoutubeVideoId(url) {
  if (!url) return null;

  try {
    // First try to parse as URL to handle encoded characters
    const urlObj = new URL(url);
    // Get video ID from search params
    const videoId = urlObj.searchParams.get('v');
    if (videoId && videoId.length === 11) return videoId;

    // If not found in search params, try regex as fallback
    const regExp = /(?:youtu\.be\/|watch\?v=|\/videos\/|embed\/|v=|)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    console.log('URL:', url);
    console.log('Match:', match);

    return (match && match[1].length === 11) ? match[1] : null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

async function main() {
  try {
    // Get the video URL from command line arguments
    const args = process.argv.slice(2);
    let videoUrl;

    // Try to find the URL in different argument formats
    if (args.includes('--videoURL')) {
      // Handle --videoURL URL format
      const index = args.indexOf('--videoURL');
      videoUrl = args[index + 1];
    } else {
      // Handle --videoURL=URL format
      const videoUrlArg = args.find(arg => arg.startsWith('--videoURL='));
      if (videoUrlArg) {
        videoUrl = videoUrlArg.substring('--videoURL='.length);
      }
    }

    if (!videoUrl) {
      console.error('Please provide a YouTube video URL using:');
      console.error('  --videoURL="URL" or');
      console.error('  --videoURL URL');
      process.exit(1);
    }

    console.log('Extracted URL:', videoUrl);
    
    // Extract video ID from URL
    const videoId = extractYoutubeVideoId(videoUrl);
    
    if (!videoId) {
      console.error('Invalid YouTube URL provided');
      console.error('URL received:', videoUrl);
      process.exit(1);
    }

    console.log('Fetching transcript for video ID:', videoId);
    
    // Get the transcript
    const transcript = await getYoutubeTranscript(videoId);
    
    // Create transcripts directory if it doesn't exist
    const transcriptsDir = path.join(process.cwd(), 'transcripts');
    await fs.mkdir(transcriptsDir, { recursive: true });
    
    // Format transcript content
    const formattedTranscript = transcript.map(segment => {
      // Convert duration to seconds and format as HH:MM:SS
      const seconds = Math.floor(segment.start);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      
      const timestamp = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        remainingSeconds.toString().padStart(2, '0')
      ].join(':');

      return `[${timestamp}] ${segment.text}`;
    }).join('\n');

    // Save to file with video ID and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${videoId}_${timestamp}.txt`;
    const filePath = path.join(transcriptsDir, filename);
    
    await fs.writeFile(filePath, formattedTranscript, 'utf-8');
    
    console.log(`\nTranscript saved to: ${filePath}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main(); 