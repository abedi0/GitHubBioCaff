import { cookies } from "next/headers";
import styles from "./page.module.css";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const API_URL = "https://api.github.com";

async function getProfile(token: string) {
    const resp = await fetch(`${API_URL}/user`, {
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
        }
    });

    if (resp.status !== 200) {
        throw new Error("Could't get profile!");
    }

    return resp.json();
}

// Example input: 10mg (string)
// returns 10 (number)
function parseCaffNumber(val: string): number {
    return parseInt(val.split("mg")[0]);
}

function hasCaffLine(val: string): boolean {
    return val.split(": ").length !== 1;
}

function caffText(message: string, caff: number): string {
    return `${message}: ${caff}mg`;
}

function currentCaff(bio: string): number {
    return parseCaffNumber(bio.split(": ")[1])
}

async function newBio(token: string, bio: string) {
    const resp = await fetch(`${API_URL}/user`, {
        method: "PATCH",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
        },

        body: JSON.stringify({ bio: bio })
    });


    return resp.status;
}


async function updateBio(currentBio: string, token: string, caff: number) {
    const hasCaff = hasCaffLine(currentBio);

    if (!hasCaff) {
        const bio = caffText("Current caffeine amount", caff);

        if (await newBio(token, bio) !== 200) {
            throw new Error("Could't Edit bio!");
        }
    }
    else {
        const c = currentCaff(currentBio) + caff;
        const bio = caffText("Current caffeine amount", c);

        if (await newBio(token, bio) !== 200) {
            throw new Error("Could't Edit bio!");
        }
    }

}


async function resetCaff(currentBio: string, token: string, caff: number) {
    const hasCaff = hasCaffLine(currentBio);

    if (!hasCaff) {
        const bio = caffText("Current caffeine amount", 0);

        if (await newBio(token, bio) !== 200) {
            throw new Error("Could't Edit bio!");
        }
    }
    else {
        const bio = caffText("Current caffeine amount", 0);

        if (await newBio(token, bio) !== 200) {
            throw new Error("Could't Edit bio!");
        }
    }
}

export default async function Home() {
    const token = cookies().get("token") || redirect("/auth");
    const profile = await getProfile(token.value);

    return (
        <>
            <h2>Hello, {profile.name}</h2>
            <h4>Current Caff: {currentCaff(profile.bio)}mg</h4>
            <form action={async () => {
                "use server";
                await updateBio(profile.bio, token.value, 75);
                revalidatePath("/")
            }}>
                <button className={styles.page}>
                    <h1>Espresso (75mg)</h1>
                </button>
            </form>

            <form action={async () => {
                "use server";
                await resetCaff(profile.bio, token.value, 0);
                revalidatePath("/")
            }}>
                <button className={styles.page} style={{ fontSize: "10px" }}>
                    <h1>Reset</h1>
                </button>
            </form>
        </>
    );
}
