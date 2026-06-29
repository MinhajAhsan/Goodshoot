import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getActiveCities } from "@/lib/data";
import { ProfileForm } from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/profile");

  const cities = await getActiveCities();

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <p className="mt-1 text-ink-soft">{user.email}</p>

      <div className="mt-8">
        <ProfileForm
          initial={{
            fullName: user.fullName ?? "",
            phone: user.phone ?? "",
            cityId: user.cityId ?? "",
          }}
          cities={cities}
        />
      </div>
    </div>
  );
}
