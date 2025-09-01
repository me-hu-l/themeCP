import { useState, useEffect } from "react";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const backend_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backend_url}/api/users/search?q=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="p-4">
      <input
        type="text"
        className="w-full p-2 border rounded-lg"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <p className="text-gray-500 text-sm">Searching...</p>}
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg max-w-60 overflow-y-auto">
          {results.map((user) => (
            <li
              key={user.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <a href={`/profile/${user.id}`} className="block w-full">
                {user.codeforces_handle}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
