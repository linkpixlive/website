import { useLoaderData, useParams } from "react-router";
import type { Route } from "./+types/$username";
import { createDonation, getStreamerByUsername, listVoices } from "~/api/modules/public-donations";
import { normalizeUsername } from "~/util/username";
import { UnifiedDonationCard } from "~/components/donate/UnifiedDonationCard";
import { DonationFooter } from "~/components/donate/DonationFooter";
import type { DonationFormValues } from "~/validators/donation-validator";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    {
      title: loaderData?.streamer
        ? `Doar para ${loaderData.streamer.name} — LinkPix`
        : "Página não encontrada — LinkPix",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const username = normalizeUsername(params.username);
  const [streamer, voices] = await Promise.all([
    username ? getStreamerByUsername(username) : null,
    listVoices(),
  ]);
  if (!streamer) {
    throw new Response("Página não encontrada", { status: 404 });
  }
  return { streamer, voices };
}

export default function DonationPage() {
  const { streamer, voices } = useLoaderData<typeof loader>();
  const { username } = useParams();

  async function handleCreateDonation(values: DonationFormValues) {
    const safeUsername = normalizeUsername(username);
    if (!safeUsername) throw new Error("Streamer inválido.");
    return createDonation(
      {
        name: values.name,
        message: values.message,
        amount: values.amount,
        voiceId: values.voiceId,
      },
      safeUsername,
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md flex flex-col gap-5 animate-fade-in">
        <UnifiedDonationCard
          profile={streamer}
          voices={voices}
          onCreateDonation={handleCreateDonation}
        />

        <DonationFooter />
      </div>
    </main>
  );
}
