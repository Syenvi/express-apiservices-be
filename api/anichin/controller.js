import axios from "axios";
import * as cheerio from "cheerio";

const author = "@futaba";
const baseUrl = "https://anichin.site";
const decodedString = (source) => {
  return Buffer.from(source, "base64").toString("utf-8");
};

const convertToSlug = (title) => {
  return title.toLowerCase().replace(/\s+/g, "-");
};

export const index = async (req, res) => {
  const { page = 1, genre = "" } = req.query;
  console.log(genre);
  try {
    const response = await axios.get(
      page && genre == ""
        ? `${baseUrl}/page/${page}`
        : `${baseUrl}/anime/?page=${page}&genre=${genre}`
    );
    const $ = cheerio.load(response.data);

    const latestMovies = $(".excstf").eq(1); // Get the second element with class excstf
    const filterMovies = $(".listupd");

    const movies = []; // Array to hold the movie data

    if (genre != "") {
      filterMovies.find(".bsx").each((i, bsx) => {
        const titleElement = $(bsx).find(".tt");
        titleElement.find("h2").remove(); // Remove any h2 elements from the title
        const title = titleElement.text().trim(); // Get the text of the title

        const slug = convertToSlug(title);

        // Get the thumbnail URL
        const thumbnail = $(bsx).find("img").attr("data-lazy-src");

        // Get the episode number or other relevant data
        const episode = $(bsx)
          .find(".limit > .bt > .epx")
          .text()
          .trim()
          .replace(/^Ep\s*/, "");

        // Add the movie data to the array
        movies.push({
          title,
          slug,
          thumbnail,
          episode,
        });
      });
    } else {
      latestMovies.find(".bsx").each((i, bsx) => {
        const titleElement = $(bsx).find(".tt");
        titleElement.find("h2").remove(); // Remove any h2 elements from the title
        const title = titleElement.text().trim(); // Get the text of the title

        const slug = convertToSlug(title);

        // Get the thumbnail URL
        const thumbnail = $(bsx).find("img").attr("data-lazy-src");

        // Get the episode number or other relevant data
        const episode = $(bsx)
          .find(".limit > .bt > .epx")
          .text()
          .trim()
          .replace(/^Ep\s*/, "");

        // Add the movie data to the array
        movies.push({
          title,
          slug,
          thumbnail,
          episode,
        });
      });
    }

    const prevPage = $(".hpage > a.l").attr("href") ? true : false;
    const nextPage = $(".hpage > a.r").attr("href") ? true : false;

    const responseData = {
      status: 200,
      author,
      message: "Success get Latest Release Data",
      data: movies,
      prevPage,
      currentPage: !prevPage ? 1 : Number(page),
      nextPage,
    };
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("An error occurred");
  }
};

export const getDetailMovie = async (req, res) => {
  try {
    const slugParams = req.params.slug;
    const url = `${baseUrl}/${slugParams}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const cover = $(".ime > img").attr("data-lazy-src");
    const thumbnail = $(".thumb > img").attr("data-lazy-src");
    const title = $(".infox > .entry-title").text();
    if (!title || title == "") {
      return res.json({
        status: 404,
        message: "Data not Found",
        data: null,
      });
    }
    const slug = convertToSlug(title);
    const rating = $(".rating > strong").text();
    const followers = $(".thumbook > .rt > .bmc").text();
    const status = $(".info-content > .spe > span")
      .eq(0)
      .find("b")
      .remove()
      .end()
      .text()
      .trim();
    const studio = $(".info-content > .spe > span")
      .eq(1)
      .find("b")
      .remove()
      .end()
      .text()
      .trim();
    const episodes = $(".info-content > .spe > span")
      .eq(8)
      .find("b")
      .remove()
      .end()
      .text()
      .trim();
    const fansub = $(".info-content > .spe > span")
      .eq(9)
      .find("b")
      .remove()
      .end()
      .text()
      .trim();
    const releasedAt = $(".info-content > .spe > span")
      .eq(11)
      .find("time")
      .text()
      .trim();
    const updatedAt = $(".info-content > .spe > span")
      .eq(12)
      .find("time")
      .text()
      .trim();

    const synopsis = $(".entry-content > p").text().trim();
    let genres = [];
    $(".genxed > a").each((i, genre) => {
      const tag = $(genre).text().trim();
      const slug = convertToSlug(tag);
      genres.push({ tag, slug });
    });

    let episodeLists = [];
    $(".eplister > ul > li").each((i, ep) => {
      const title = $(ep).find("a > .epl-title").text().trim();
      const episode = $(ep).find("a > .epl-num").text().trim();
      const releasedAt = $(ep).find("a > .epl-date").text().trim();
      episodeLists.push({ title, episode, releasedAt });
    });
    const responseData = {
      status: 200,
      author,
      message: "Success get Movie Data",
      title,
      slug,
      cover,
      thumbnail,
      rating,
      followers,
      synopsis,
      genres,
      info: {
        status,
        studio,
        episodes,
        fansub,
        releasedAt,
        updatedAt,
      },
      episodeLists,
    };

    res.json(responseData);
  } catch (error) {
    res.json({ msg: error.message });
  }
};

export const getDetailEpisode = async (req, res) => {
  const slug = req.params.slug;
  const episode = req.params.episode;
  const url = `${baseUrl}/${slug}-episode-${episode}-subtitle-indonesia`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $(".title-section > h1").text().trim();
    if (!title || title == "") {
      return res.json({
        status: 404,
        message: "Data not Found",
        data: null,
      });
    }
    const releasedAt = $(".lm > span.year > span.updated").text().trim();
    const series = $(".lm > span.year > a").text().trim();
    const series_slug = convertToSlug(series);

    const prev_episode_number = $(
      '.naveps.bignav > .nvs > a[aria-label="prev"]'
    ).attr("href")
      ? Number(episode) - 1
      : null;
    const next_episode_number = $(
      '.naveps.bignav > .nvs > a[aria-label="next"]'
    ).attr("href")
      ? Number(episode) + 1
      : null;

    const videoSources = [];

    $(".item.video-nav > .mobius > select > option").each((i, option) => {
      const videoPlayerElement = $(option).attr("value");
      const sourceTitle = $(option).text().trim();

      if (videoPlayerElement !== "") {
        videoSources.push({
          sourceTitle,
          videoPlayerElement: decodedString(videoPlayerElement),
        });
      }
    });

    const responseData = {
      status: 200,
      author,
      message: "Success get Movie Episode Data",
      title,
      releasedAt,
      series,
      series_slug,
      videoSources,
      prev_episode_number,
      next_episode_number,
    };

    return res.json(responseData);
  } catch (error) {
    res.json({ msg: error.message });
  }
};

export const getSearch = async (req, res) => {
  const { page = 1, query = "" } = req.query;
  if (!query) {
    return res.json({
      status: 404,
      message: "Not Found !",
      docs: "www.www",
    });
  }
  try {
    const response = await axios.get(
      page != 1
        ? `${baseUrl}/page/${page}/?s=${query}`
        : `${baseUrl}/?s=${query}`
    );
    const $ = cheerio.load(response.data);

    const filterMovies = $(".listupd");
    const movies = [];

    filterMovies.find(".bsx").each((i, bsx) => {
      const titleElement = $(bsx).find(".tt");
      titleElement.find("h2").remove(); // Remove any h2 elements from the title
      const title = titleElement.text().trim(); // Get the text of the title

      const slug = convertToSlug(title);

      // Get the thumbnail URL
      const thumbnail = $(bsx).find("img").attr("data-lazy-src");

      // Get the episode number or other relevant data
      const episode = $(bsx)
        .find(".limit > .bt > .epx")
        .text()
        .trim()
        .replace(/^Ep\s*/, "");

      // Add the movie data to the array
      movies.push({
        title,
        slug,
        thumbnail,
        episode,
      });
    });

    const prevPage = $(".pagination > a.prev").attr("href") ? true : false;
    const nextPage = $(".pagination > a.next").attr("href") ? true : false;

    const responseData = {
      status: 200,
      author,
      message: "Success get Latest Release Data",
      data: movies,
      prevPage,
      currentPage: !prevPage ? 1 : Number(page),
      nextPage,
    };
    res.json(responseData);
  } catch (error) {
    return res.json({
      status: 404,
      message: error.message,
    });
  }
};
