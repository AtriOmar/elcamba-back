const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");

const publicFolderPath = path.join(__dirname, "..", "public/uploads");

module.exports = async (req, res) => {
  const filename = req.query.path;
  const requestedSize = Number(req.query.size) >= 50 ? Number(req.query.size) : undefined;

  console.log(filename);
  if (!filename) {
    return res.status(404).send("Photo not found");
  }

  const filepath = "./public/uploads/" + filename;
  const absoluteFilepath = path.join(publicFolderPath, filename);

  // Check if the file exists
  if (!fs.existsSync(filepath)) {
    return res.status(404).send("Photo not found");
  }

  if (!requestedSize) return res.sendFile(absoluteFilepath);

  // Read the file
  const image = sharp(filepath);

  const options = {};
  try {
    const metadata = await image.metadata();

    if (metadata.width > metadata.height) {
      if (requestedSize < metadata.width) options.width = requestedSize;
      else return res.sendFile(absoluteFilepath);
    } else {
      if (requestedSize < metadata.height) options.height = requestedSize;
      else return res.sendFile(absoluteFilepath);
    }

    // Resize the photo
    const buffer = await image.resize(options).toBuffer();
    res.type(metadata.format);
    res.send(buffer);
  } catch (err) {
    res.status(400).send(err);
  }
};
