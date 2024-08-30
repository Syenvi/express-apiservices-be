import axios from "axios";
import * as cheerio from "cheerio";

export const index = async (req, res) => {
  const url = "https://anichin.site";

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const latestMovies = $(".excstf").eq(1); // Get the second element with class excstf

    const movies = []; // Array to hold the movie data

    latestMovies.find(".bsx").each((i, bsx) => {
      const titleElement = $(bsx).find(".tt");
      titleElement.find("h2").remove(); // Remove any h2 elements from the title
      const title = titleElement.text().trim(); // Get the text of the title

      // Get the href URL
      const link = $(bsx).find("a").attr("href");

      // Get the thumbnail URL
      const thumbnail = $(bsx).find("img").attr("data-lazy-src");

      // Get the episode number or other relevant data
      const episode = $(bsx).find(".limit > .bt > .epx").text().trim(); // Adjust the selector based on your HTML structure

      // Add the movie data to the array
      movies.push({
        title,
        thumbnail,
        episode,
        link: encodeURIComponent(link),
      });
    });
    const responseData = {
      status: 200,
      author: "@futaba",
      data: movies,
    };
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("An error occurred");
  }
};

export const getDetailMovie = async (req, res) => {
  try {
    const url = req.params;
    const response = await axios.get("https://anichin.site/perfect-world/");
    const $ = cheerio.load(response.data);

    const cover = $(".ime > img").attr("data-lazy-src");

    res.json({ w: cover });
  } catch (error) {
    res.json({ msg: error.message });
  }
};
