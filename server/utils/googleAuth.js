// Google token verification utility
// Verifies a Google ID token or access token by calling Google's API

const https = require('https');

/**
 * Verify a Google ID token or access token and return the user payload.
 * Falls back to tokeninfo endpoint if Google client library is not configured.
 * @param {string} token - Google ID token or access token
 * @returns {Promise<{email, name, picture, sub}|null>}
 */
async function verifyGoogleToken(token) {
  if (!token) return null;

  try {
    // Use Google's tokeninfo endpoint to validate
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`;
    
    const data = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.error) reject(new Error(parsed.error_description || parsed.error));
            else resolve(parsed);
          } catch { reject(new Error('Failed to parse Google response')); }
        });
      }).on('error', reject);
    });

    // Optional: verify audience matches our client ID
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && data.aud && data.aud !== clientId) {
      console.warn('Google token audience mismatch:', data.aud, 'vs', clientId);
      return null;
    }

    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
      sub: data.sub,
      emailVerified: data.email_verified === 'true',
    };
  } catch (err) {
    // If ID token failed, try access token userinfo endpoint
    try {
      const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(token)}`;
      const data = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch { reject(new Error('Failed to parse Google userinfo')); }
          });
        }).on('error', reject);
      });

      if (data.error) throw new Error(data.error.message || 'Token invalid');

      return {
        email: data.email,
        name: data.name,
        picture: data.picture,
        sub: data.sub,
        emailVerified: data.email_verified,
      };
    } catch (innerErr) {
      console.error('Google token verification failed:', innerErr.message);
      return null;
    }
  }
}

module.exports = { verifyGoogleToken };
