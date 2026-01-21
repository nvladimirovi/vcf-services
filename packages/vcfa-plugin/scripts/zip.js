const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Zips the contents of a given folder (not the folder itself) into a specified zip file.
 * The files and subfolders within the source folder will be at the root of the zip.
 *
 * @param {string} sourceFolder The path to the folder whose contents need to be zipped.
 * @param {string} outputZipFile The name of the output zip file (e.g., "plugin.zip").
 * @returns {Promise<void>} A promise that resolves when zipping is complete or rejects on error.
 */
async function zipFolderContents(sourceFolder, outputZipFile = 'plugin.zip') {
    // Resolve the absolute path for the source folder
    const absoluteSourcePath = path.resolve(sourceFolder);
    const outputFilePath = path.resolve(outputZipFile);

    console.log(`Starting to zip contents of folder: '${absoluteSourcePath}'`);
    console.log(`Outputting to: '${outputFilePath}'`);

    // Ensure the source folder exists
    if (!fs.existsSync(absoluteSourcePath)) {
        console.error(`Error: Source folder '${absoluteSourcePath}' does not exist.`);
        process.exit(1);
    }
    if (!fs.statSync(absoluteSourcePath).isDirectory()) {
        console.error(`Error: Source path '${absoluteSourcePath}' is not a directory.`);
        process.exit(1);
    }

    // Create a file to stream archive data to.
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    return new Promise((resolve, reject) => {
        // Listen for all archive data to be written
        output.on('close', () => {
            console.log(`Archive created successfully!`);
            resolve();
        });

        // Catch warnings (e.g., file not found)
        archive.on('warning', err => {
            if (err.code === 'ENOENT') {
                console.warn(`Archiver warning: ${err.message}`);
            } else {
                console.error(`Archiver warning: ${err.message}`);
            }
        });

        // Catch errors
        archive.on('error', err => {
            console.error(`Archiver error: ${err.message}`);
            reject(err);
        });

        // Pipe archive data to the file
        archive.pipe(output);

        // Append the contents of the folder.
        // By passing `false` as the second argument, archiver places the
        // contents directly at the root of the archive, rather than
        // nesting them within a folder named after `absoluteSourcePath`.
        archive.directory(absoluteSourcePath, false);

        // Finalize the archive (i.e., close the output stream)
        archive.finalize();
    });
}

// --- Script Execution ---
const args = process.argv.slice(2); // Get command line arguments (excluding 'node' and script name)
let folderToZip = '.';              // Default to current directory
let outputFileName = 'plugin.zip';  // Default output file name

if (args.length > 0) {
    folderToZip = args[0];
}
if (args.length > 1) {
    outputFileName = args[1];
}
if (args.length > 2) {
    console.warn('Too many arguments provided. Usage: node zipFolder.js <folder_to_zip> [output_zip_name]');
}

(async () => {
    try {
        await zipFolderContents(folderToZip, outputFileName);
        console.log(`Successfully created '${outputFileName}' with contents from '${folderToZip}'.`);
    } catch (error) {
        console.error(`Failed to zip folder contents: ${error.message}`);
        process.exit(1);
    }
})();
