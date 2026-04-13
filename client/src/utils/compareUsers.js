export function compareUsers(user1, user2) {
  const sharedArtists = user1.topArtists.filter(a1 =>
    user2.topArtists.some(a2 => a2.id === a1.id)
  );

  const sharedTracks = user1.topTracks.filter(t1 =>
    user2.topTracks.some(t2 => t2.id === t1.id)
  );

  const user1Genres = user1.topArtists.flatMap(a => a.genres);
  const user2Genres = user2.topArtists.flatMap(a => a.genres);
  const sharedGenres = [...new Set(user1Genres.filter(g => user2Genres.includes(g)))];

  const uniqueToUser1 = user1.topArtists.filter(a1 =>
    !user2.topArtists.some(a2 => a2.id === a1.id)
  );
  const uniqueToUser2 = user2.topArtists.filter(a2 =>
    !user1.topArtists.some(a1 => a1.id === a2.id)
  );

  const score = (sharedArtists.length * 2 + sharedGenres.length) /
    (user1.topArtists.length * 2 + user1Genres.length) * 100;

  return { sharedArtists, sharedTracks, sharedGenres, uniqueToUser1, uniqueToUser2, score };
}