
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
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

export async function POST(request: Request) {
    try {
        // Receive data sent by the frontend
        const body = await request.json();

        const profileId = body.profileId;
        const action = body.action;

        // Validate profile ID and action
        if (
            !Number.isInteger(profileId) ||
            profileId <= 0 ||
            !["like", "pass"].includes(action)
        ) {
            return NextResponse.json(
                { error: "Invalid swipe data" },
                { status: 400 }
            );
        }

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

        // Check whether the profile exists
        const profile = profiles.find(
            (item) => item.id === profileId
        );

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        // Prevent duplicate swipes
        const alreadySwiped = swipes.some(
            (swipe) =>
                swipe.userId === "current-user" &&
                swipe.profileId === profileId
        );

        if (alreadySwiped) {
            return NextResponse.json(
                { error: "You have already swiped on this profile" },
                { status: 409 }
            );
        }

        // Save the user's swipe
        const newSwipe: Swipe = {
            userId: "current-user",
            profileId,
            action,
        };

        swipes.push(newSwipe);

        await writeFile(
            swipesPath,
            JSON.stringify(swipes, null, 2),
            "utf-8"
        );

        // Check for a mutual match
        const isMatch =
            action === "like" &&
            profile.likedCurrentUser === true;

        // Return matched profile only for mutual likes
        if (isMatch) {
            return NextResponse.json({
                success: true,
                match: true,
                matchedProfile: {
                    id: profile.id,
                    name: profile.name,
                    age: profile.age,
                    photo: profile.photo,
                    bio: profile.bio,
                    city: profile.city,
                    interests: profile.interests,
                },
            });
        }

        // Never reveal non-mutual incoming likes
        return NextResponse.json({
            success: true,
            match: false,
        });

    } catch (error) {
        console.error("Swipe API error:", error);

        return NextResponse.json(
            { error: "Unable to process swipe" },
            { status: 500 }
        );
    }
}
