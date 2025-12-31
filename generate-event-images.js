/**
 * Event Images List Generator
 * 
 * Run this script whenever you add/remove images in the Images/events folder.
 * It will automatically update the event-images.json file.
 * 
 * Usage: 
 *   1. Open terminal in the project root folder
 *   2. Run: node generate-event-images.js
 */

const fs = require('fs');
const path = require('path');

const eventsFolder = path.join(__dirname, 'Images', 'events');
const outputFile = path.join(eventsFolder, 'event-images.json');

// Supported image extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

try {
    // Read all files in the events folder
    const files = fs.readdirSync(eventsFolder);

    // Filter only image files (exclude the json config file)
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
    });

    // Sort alphabetically
    imageFiles.sort();

    // Write to JSON file
    fs.writeFileSync(outputFile, JSON.stringify(imageFiles, null, 2));

    console.log('✅ event-images.json updated successfully!');
    console.log(`Found ${imageFiles.length} image(s):`);
    imageFiles.forEach(img => console.log(`   - ${img}`));
} catch (err) {
    console.error('❌ Error:', err.message);
}
