const gc = require('./config/');
const bucket = gc.bucket('pinterest-enhanced-ob'); // your bucket name

const uploadToGCS = (uploadFile, filename, next) => {
    //   const blob = bucket.file(uploadFile.originalname.replace(/ /g, "_"));
    const blob = bucket.file(filename.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    blobStream.on('finish', () => {
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        next(null, imageUrl);
    })
        .on('error', (err) => {
            next(new Error(`Unable to upload image, something went wrong: ${err.message}`));
        })
        .end(uploadFile.buffer);
};

module.exports = uploadToGCS;