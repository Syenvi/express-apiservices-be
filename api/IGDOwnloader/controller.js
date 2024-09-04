import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const index = async (req, res) => {
  try {
    const url =
      "https://instagram.fjog3-1.fna.fbcdn.net/v/t51.29350-15/412651454_384401190737719_4701237706239069970_n.webp?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi45NjB4MTIwMC5zZHIuZjI5MzUwLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=instagram.fjog3-1.fna.fbcdn.net&_nc_cat=107&_nc_ohc=eTo0RXU-urgQ7kNvgETO-T3&edm=AEhyXUkBAAAA&ccb=7-5&ig_cache_key=MzI2NjM1NDUwMDE3ODc2MzAxMw%3D%3D.2-ccb7-5&oh=00_AYD0kgZLnJ-vaobJfmbQnHjhVxmKcE67OT92_QPAxaFQmA&oe=66DDFCA3&_nc_sid=8f1549";
    const filename = "downloaded-image.jpg";

    // Unduh gambar
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream", // Mengambil respons sebagai stream
    });

    // Simpan gambar ke file
    const filePath = path.join(__dirname, filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on("finish", () => {
      console.log("Image downloaded successfully.");

      // Kirim file ke klien
      res.download(filePath, (err) => {
        if (err) {
          console.error("Error during file download:", err);
          res.status(500).send("Failed to download image.");
        } else {
          console.log("File sent to client successfully.");
        }
      });
    });

    writer.on("error", (err) => {
      console.error("Error writing file:", err);
      res.status(500).send("Failed to save image.");
    });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).send("An error occurred while downloading the image.");
  }
};
