import { toCamelKeys } from "keys-transform";
import { Service } from "typedi";
import db from "../../../db/connection";

@Service()
export class MovieService {
  constructor() {}

  async getMovieList() {
    const sql = `SELECT * FROM movies.movie_list`;
    const movieList = (await db.getConnection().query(sql, [])).rows[0];
    return movieList ? (toCamelKeys(movieList) as any) : [];
  }

  async updateMovieRating(id: number) {
    const sql = `SELECT * FROM movies.movie_list where id = $1`;
    const MovieList = (await db.getConnection().query(sql, [id])).rows[0];
    MovieList ? (toCamelKeys(MovieList) as any) : [];

    const ratingNumber = Number(MovieList.rating) + 1;
    const sqlUpdate = `UPDATE movies.movie_list SET rating = $1 WHERE id = $2`;
    const result = (await db.getConnection().query(sqlUpdate, [ratingNumber, id]));
    return result;
  }
}
