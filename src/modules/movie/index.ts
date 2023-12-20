import { Application } from "express";
import { movieRouter } from "../movie/routes/movie.route";

export function init(app: Application) {
  app.use("/movie", movieRouter);
}
