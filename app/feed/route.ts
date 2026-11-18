
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Define the structure of a profile
type Profile = {
    id: number;
    name: string;
    age: number;
    photo: string;
    bio: string;
    city: string;
    interests: string[];
    likedCurrentUser: boolean;
};

// Define the structure of a swipe
type Swipe = {
    userId: string;
    profileId: number;
    action: "like" | "pass";
};

// GET API: Fetch profiles for Discover
export async function GET() {
    try {
        // Find the location of our JSON files
        const profilesPath = path.join(
            process.cwd(),
            "data",
            "profiles.json"
        );

        const swipesPath = path.join(
            process.cwd(),
            "data",
            "swipes.json"
        );

        // Read both JSON files
        const profilesData = await readFile(profilesPath, "utf-8");
        const swipesData = await readFile(swipesPath, "utf-8");

        // Convert JSON text into JavaScript data
        const profiles: Profile[] = JSON.parse(profilesData);
        const swipes: Swipe[] = JSON.parse(swipesData);

        // Find profiles already swiped on by our user
        const swipedProfileIds = new Set(
            swipes
                .filter((swipe) => swipe.userId === "current-user")
                .map((swipe) => swipe.profileId)
        );

        // Keep only profiles that have not been swiped on
        const feedProfiles = profiles
            .filter((profile) => !swipedProfileIds.has(profile.id))
            .map(({ likedCurrentUser, ...publicProfile }) => publicProfile);

        // Send the profiles back to the browser
        return NextResponse.json(feedProfiles);

    } catch (error) {
        console.error("Feed API error:", error);

        return NextResponse.json(
            { error: "Unable to load profiles" },
            { status: 500 }
        );
    }
}
