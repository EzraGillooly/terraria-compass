import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <>
      <h1>Page Not Found</h1>
      <p>That route does not exist yet.</p>
      <p>
        <Link to="/">Back to home</Link>
      </p>
    </>
  );
}
