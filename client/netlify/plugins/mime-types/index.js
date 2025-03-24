module.exports = {
    onPostBuild: ({ utils }) => {
      console.log('Setting correct MIME types for JavaScript files');
      
      // Create or modify _headers file
      const fs = require('fs');
      const path = require('path');
      
      const headersPath = path.join(process.cwd(), 'dist', '_headers');
      
      const headersContent = `
  # Set correct MIME types for JavaScript files
  /*.js
    Content-Type: text/javascript
  /*.mjs
    Content-Type: text/javascript
  /*.ts
    Content-Type: text/javascript
  /*.tsx
    Content-Type: text/javascript
  /*.jsx
    Content-Type: text/javascript
  /assets/*.js
    Content-Type: text/javascript
  /chunks/*.js
    Content-Type: text/javascript
  /*
    X-Content-Type-Options: nosniff
  `;
      
      try {
        fs.writeFileSync(headersPath, headersContent);
        console.log('Successfully wrote _headers file');
      } catch (error) {
        console.error('Error writing _headers file:', error);
      }
    }
  };