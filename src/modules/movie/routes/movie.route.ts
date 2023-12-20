import express, { NextFunction, Request, Response, Router } from "express";
import Container from "typedi";
import { wrap } from "../../../middlewares/wraps.middle";
import { MovieService } from "../services/movie.service";
const router: Router = express.Router();

router.get(
  "/get-movie-list",
  wrap(async (req: Request, res: Response, next: NextFunction) => {
    const movieService: MovieService = Container.get(MovieService);

    const result = await movieService.getMovieList();
    return res.status(200).json({
      message: "Request Successful",
      data: result,
    });
  })
);

router.put(
  "/get-movie-list/:id",
  wrap(async (req: Request, res: Response, next: NextFunction) => {
    const movieService: MovieService = Container.get(MovieService);
    console.log({ req: req.params.id, par: req.body });
    const movieId = Number(req.params.id);
    const result = await movieService.updateMovieRating(movieId);

    return res.status(200).json({
      message: "Request Successful",
      data: result,
    });
  })
);

export { router as movieRouter };
