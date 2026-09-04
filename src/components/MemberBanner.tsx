import { logoutMemberAction } from "@/app/actions/signups";
import type { CurrentMember } from "@/lib/types";

interface MemberBannerProps {
  member: CurrentMember | null;
}

export function MemberBanner({ member }: MemberBannerProps) {
  if (!member) return null;

  return (
    <div className="border-b border-navy-100 bg-navy-50">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm sm:px-6">
        <p className="text-navy-800">
          Signed in as <span className="font-semibold">{member.name}</span>{" "}
          <span className="text-navy-500">({member.email})</span>
        </p>
        <form action={logoutMemberAction}>
          <button
            type="submit"
            className="font-medium text-navy-700 underline decoration-gold-500 underline-offset-2 hover:text-gold-600"
          >
            Not you? Switch account
          </button>
        </form>
      </div>
    </div>
  );
}
