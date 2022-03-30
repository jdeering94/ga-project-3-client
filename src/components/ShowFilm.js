import React from 'react';
import { Rating } from 'react-simple-star-rating';
import {
  getFilmById,
  createComment,
  deleteComment,
  addLikedFilm,
  removeLikedFilm,
} from '../api/films';
import { useParams } from 'react-router-dom';
import { getLoggedInUserId } from '../lib/authentication';
import { averageRating } from '../lib/ratingFunctions';
import { getCurrentUserById } from '../api/auth';

const ShowFilm = () => {
  const { filmId } = useParams();
  const [film, setFilm] = React.useState(null);
  const [commentValue, setCommentValue] = React.useState('');
  const [ratingValue, setRatingValue] = React.useState(1);
  const [username, SetUsername] = React.useState('');

  React.useEffect(() => {
    const getData = async () => {
      const filmdata = await getFilmById(filmId);
      if (window.sessionStorage.token) {
        const user = await getCurrentUserById(getLoggedInUserId());
        SetUsername(user.username);
      }
      setFilm(filmdata);
    };
    getData();
  }, []);

  if (!film) {
    return <p>Loading...</p>;
  }

  const handleCommentChange = (e) => {
    setCommentValue(e.target.value);
  };

  const handleRating = (rate) => {
    console.log(rate);
    setRatingValue(rate / 10);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const data = await createComment(filmId, {
      text: commentValue,
      rating: ratingValue,
      username: username,
    });
    setCommentValue('');
    setFilm(data);
  };

  const handleCommentDelete = async (commentId) => {
    const data = await deleteComment(filmId, commentId);
    setFilm(data);
  };

  const handleLike = async () => {
    const data = await addLikedFilm(filmId);
    setFilm(data);
  };

  const handleUnlike = async () => {
    const data = await removeLikedFilm(filmId);
    setFilm(data);
  };

  const average = averageRating(film);

  return (
    <div className="container">
      <div className="columns">
        <div className="column is-half">
          <figure className="image">
            <img src={film.img} alt={film.title} />
          </figure>
        </div>
        <div className="column is-half">
          <div className="card p-6">
            <h2 className="title">{film.title}</h2>
            <p>Country of Origin: {film.country}</p>
            <p>Director: {film.director}</p>
            <p>Released in: {film.releaseYear}</p>
            <p>Runtime: {film.runTime} min</p>
            <p>Description: {film.description}</p>
            <p>Likes: {film.likedBy.length}</p>
            {average ? <p>Average Rating: {average}</p> : <p>Not yet rated</p>}
            {getLoggedInUserId() && (
              <>
                <button className="button is-info" onClick={handleLike}>
                  Like
                </button>
                <button className="button is-dark" onClick={handleUnlike}>
                  Unlike
                </button>
              </>
            )}
          </div>

          {getLoggedInUserId() && (
            <form onSubmit={handleCommentSubmit}>
              <div className="form">
                <label htmlFor="comment" className="label">
                  Post a new a Comment
                </label>
                <div className="control">
                  <textarea
                    name="text"
                    className="input"
                    value={commentValue}
                    onChange={handleCommentChange}
                  ></textarea>
                  <Rating
                    onClick={handleRating}
                    value={ratingValue}
                    iconsCount={10}
                  />
                  <input type="submit" value="Post Comment" />
                </div>
              </div>
            </form>
          )}

          {film.comments.length > 0 && (
            <div className="card p-4 m-3">
              <h1>Reviews</h1>
              {film.comments.map((comment) => {
                return (
                  <div key={comment._id}>
                    <p>{comment.text}</p>
                    <p>{comment.rating} ⭐️</p>
                    <p>{comment.username}</p>
                    {getLoggedInUserId() === comment.createdBy && (
                      <button
                        key={comment._id}
                        type="button"
                        className="button is-danger"
                        onClick={() => handleCommentDelete(comment._id)}
                      >
                        Delete Comment
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowFilm;
