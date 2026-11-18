
"use client";

import { useEffect, useRef, useState } from "react";

type Profile = {
  id: number;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
};

type Match = Profile;

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "Home" | "Discover" | "Matches"
  >("Discover");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [swiping, setSwiping] = useState(false);
  const [swipeFeedback, setSwipeFeedback] = useState("");
  const [matchPopup, setMatchPopup] = useState<Profile | null>(null);

  // Used to track finger/mouse movement
  const dragStartX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);

  // Fetch profiles from GET /feed
  async function fetchProfiles() {
    try {
      const response = await fetch("/feed");

      if (!response.ok) {
        throw new Error("Failed to load profiles");
      }

      const data: Profile[] = await response.json();
      setProfiles(data);
      setError("");
    } catch {
      setError("Unable to load profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch mutual matches from GET /matches
  async function fetchMatches() {
    try {
      const response = await fetch("/matches");

      if (!response.ok) {
        throw new Error("Failed to load matches");
      }

      const data = await response.json();
      setMatches(data.matches ?? []);
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  }

  // Load data when the page opens
  useEffect(() => {
    fetchProfiles();
    fetchMatches();
  }, []);

  const currentProfile = profiles[0];

  // Handle Like and Pass
  async function handleSwipe(action: "like" | "pass") {
    if (!currentProfile || swiping) return;

    const profile = currentProfile;

    setSwiping(true);
    setSwipeFeedback(action === "like" ? "LIKE ❤️" : "PASS ✖️");

    try {
      const response = await fetch("/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: profile.id,
          action: action,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to record swipe");
      }

      const result = await response.json();

      // Remove the swiped profile from the feed
      setProfiles((previous) =>
        previous.filter((item) => item.id !== profile.id)
      );

      // Show popup only when a mutual match is created
      if (result.match === true) {
        setMatchPopup(result.matchedProfile ?? profile);
        await fetchMatches();
      }
    } catch (err) {
      console.error("Swipe error:", err);
      setError("Unable to save your swipe. Please try again.");
    } finally {
      setDragX(0);
      dragStartX.current = null;
      setSwipeFeedback("");
      setSwiping(false);
    }
  }

  // Start dragging the profile card
  function handlePointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (swiping || matchPopup) return;

    dragStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  // Move the profile card with the pointer
  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (dragStartX.current === null || swiping) return;

    setDragX(event.clientX - dragStartX.current);
  }

  // Decide Like or Pass when dragging ends
  function handlePointerUp() {
    if (dragStartX.current === null) return;

    const distance = dragX;

    dragStartX.current = null;

    if (distance > 100) {
      handleSwipe("like");
    } else if (distance < -100) {
      handleSwipe("pass");
    } else {
      setDragX(0);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf8] text-gray-900 pb-24">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold">
          coy<span className="text-pink-500">.</span>
        </h1>

        <span className="text-sm text-gray-500">
          Discover connections
        </span>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-md px-5 py-8">

        {/* HOME TAB */}
        {activeTab === "Home" ? (

          <div></div>

        ) : activeTab === "Matches" ? (

          /* MATCHES TAB */
          <div>

            <h2 className="text-3xl font-bold text-center mb-2">
              Your Matches ❤️
            </h2>

            <p className="text-center text-gray-500 mb-8">
              People who liked you back.
            </p>

            {matches.length === 0 ? (

              <div className="text-center py-16">
                <div className="text-5xl mb-4">💗</div>

                <h3 className="text-xl font-semibold">
                  No matches yet
                </h3>

                <p className="text-gray-500 mt-2">
                  Keep discovering to find meaningful connections!
                </p>
              </div>

            ) : (

              <div className="space-y-4">

                {matches.map((match) => (

                  <div
                    key={match.id}
                    className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
                  >

                    <img
                      src={match.photo}
                      alt={match.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />

                    <div className="flex-1">

                      <h3 className="font-bold text-lg">
                        {match.name}, {match.age}
                      </h3>

                      <p className="text-gray-500 text-sm">
                        {match.city}
                      </p>

                      <p className="text-pink-500 text-sm mt-1">
                        It's a match! ❤️
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        ) : (

          /* DISCOVER TAB */
          <div>

            <h2 className="text-3xl font-bold text-center mb-2">
              Discover
            </h2>

            <p className="text-center text-gray-500 mb-8">
              Meet new people and find meaningful connections.
            </p>

            {loading ? (

              <p className="text-center py-10">
                Loading profiles...
              </p>

            ) : error ? (

              <p className="text-center text-red-500 py-10">
                {error}
              </p>

            ) : !currentProfile ? (

              <div className="text-center py-16">
                <div className="text-5xl mb-4">✨</div>

                <h3 className="text-xl font-semibold">
                  You've seen everyone!
                </h3>

                <p className="text-gray-500 mt-2">
                  Check back later for more profiles.
                </p>
              </div>

            ) : (

              <>

                {/* Profile Card */}
                <div
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={() => {
                    dragStartX.current = null;
                    setDragX(0);
                  }}
                  style={{
                    transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
                    transition:
                      dragStartX.current === null
                        ? "transform 0.3s ease"
                        : "none",
                    touchAction: "pan-y",
                  }}
                  className="overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 cursor-grab active:cursor-grabbing select-none"
                >

                  <div className="relative">

                    <img
                      src={currentProfile.photo}
                      alt={currentProfile.name}
                      draggable={false}
                      className="w-full h-[380px] object-cover pointer-events-none"
                    />

                    {Math.abs(dragX) > 40 && (
                      <div
                        className={`absolute top-8 ${dragX > 0 ? "left-6" : "right-6"
                          } rounded-lg border-4 px-4 py-2 text-2xl font-bold ${dragX > 0
                            ? "border-green-500 text-green-500"
                            : "border-red-500 text-red-500"
                          }`}
                      >
                        {dragX > 0 ? "LIKE" : "PASS"}
                      </div>
                    )}

                  </div>

                  <div className="p-6">

                    <h3 className="text-2xl font-bold">
                      {currentProfile.name}, {currentProfile.age}
                    </h3>

                    <p className="text-gray-500 mt-1">
                      {currentProfile.city}
                    </p>

                    <p className="mt-4 text-gray-700">
                      {currentProfile.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-5">

                      {currentProfile.interests.map((interest) => (

                        <span
                          key={interest}
                          className="rounded-full bg-pink-50 text-pink-600 px-3 py-2 text-sm"
                        >
                          {interest}
                        </span>

                      ))}

                    </div>

                  </div>

                </div>

                {/* Like and Pass Buttons */}
                <div className="flex justify-center items-center gap-10 mt-8">

                  <button
                    onClick={() => handleSwipe("pass")}
                    disabled={swiping}
                    className="h-16 w-16 rounded-full bg-white border-2 border-red-200 text-red-500 text-3xl shadow-md hover:bg-red-50 disabled:opacity-50"
                  >
                    ✕
                  </button>

                  <button
                    onClick={() => handleSwipe("like")}
                    disabled={swiping}
                    className="h-16 w-16 rounded-full bg-pink-500 text-white text-3xl shadow-md hover:bg-pink-600 disabled:opacity-50"
                  >
                    ♥
                  </button>

                </div>

                <p className="text-center text-gray-400 text-sm mt-4">
                  Swipe right to Like · Swipe left to Pass
                </p>

                {swipeFeedback && (
                  <p className="text-center font-bold text-pink-500 mt-3">
                    {swipeFeedback}
                  </p>
                )}

              </>

            )}

          </div>

        )}

      </section>

      {/* Match Popup */}
      {matchPopup && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">

          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">

            <div className="text-5xl mb-4">
              💖
            </div>

            <h2 className="text-3xl font-bold text-pink-500">
              It's a Match!
            </h2>

            <p className="text-gray-500 mt-2">
              You and {matchPopup.name} liked each other!
            </p>

            <img
              src={matchPopup.photo}
              alt={matchPopup.name}
              className="h-32 w-32 rounded-full object-cover mx-auto mt-6"
            />

            <h3 className="text-xl font-bold mt-4">
              {matchPopup.name}, {matchPopup.age}
            </h3>

            <button
              onClick={() => {
                setMatchPopup(null);
                setActiveTab("Matches");
              }}
              className="w-full mt-6 rounded-full bg-pink-500 py-3 text-white font-semibold hover:bg-pink-600"
            >
              See Your Matches ❤️
            </button>

            <button
              onClick={() => setMatchPopup(null)}
              className="mt-4 text-gray-500 text-sm"
            >
              Continue Discovering
            </button>

          </div>

        </div>

      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">

        <div className="mx-auto flex max-w-2xl">

          <button
            onClick={() => setActiveTab("Home")}
            className={`flex-1 py-4 font-medium ${activeTab === "Home"
                ? "text-pink-600"
                : "text-gray-400"
              }`}
          >
            Home
          </button>

          <button
            onClick={() => setActiveTab("Discover")}
            className={`flex-1 py-4 font-medium ${activeTab === "Discover"
                ? "text-pink-600"
                : "text-gray-400"
              }`}
          >
            Discover
          </button>

          <button
            onClick={() => setActiveTab("Matches")}
            className={`flex-1 py-4 font-medium ${activeTab === "Matches"
                ? "text-pink-600"
                : "text-gray-400"
              }`}
          >
            Matches ❤️
          </button>

        </div>

      </nav>

    </main>
  );
}
