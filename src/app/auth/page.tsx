import { cookies } from "next/headers"
import { redirect } from "next/navigation";

async function set_token_cookie(token: string) {
    cookies().set("token", token);
}

export default async function Page() {
    return (
        <form action={async (form: FormData) => {
            "use server";

            await set_token_cookie(form.get("token")?.toString() || "");

            redirect("/");
        }}>
            <label>Enter API Token</label>
            <input type="text" placeholder="Github API Token" name="token" />
            <input type="submit" value="Ok" />
        </form>
    )
}
