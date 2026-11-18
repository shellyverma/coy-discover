
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

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

type Swipe = {
    userId: string;
    profileId: number;
    action: "like" | "pass";
};

export async function GET() {
    try {
        // Locate JSON files
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

        // Read saved data
        const profilesData = await readFile(profilesPath, "utf-8");
        const swipesData = await readFile(swipesPath, "utf-8");

        const profiles: Profile[] = JSON.parse(profilesData);
        const swipes: Swipe[] = JSON.parse(swipesData);

        // Find profiles liked by the current user
        const likedProfileIds = swipes
            .filter(
                (swipe) =>
                    swipe.userId === "current-user" &&
                    swipe.action === "like"
            )
            .map((swipe) => swipe.profileId);

        // Return only mutual matches
        const matches = profiles
            .filter(
                (profile) =>
                    likedProfileIds.includes(profile.id) &&
                    profile.likedCurrentUser === true
            )
            .map(({ likedCurrentUser, ...publicProfile }) => publicProfile);

        return NextResponse.json({
            success: true,
            totalMatches: matches.length,
            matches,
        });

    } catch (error) {
        console.error("Matches API error:", error);

        return NextResponse.json(
            { error: "Unable to load matches" },
            { status: 500 }
        );
    }
}
