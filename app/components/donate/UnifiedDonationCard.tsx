import { AlertMessage } from "~/components/ui/AlertMessage";
import type {
  DonationPayment,
  StreamerProfile,
  TtsVoice,
} from "~/types/donation";
import type { DonationFormValues } from "~/validators/donation-validator";
import { DonationFormInner } from "./DonationForm";
import { PaymentStep } from "./PaymentStep";
import { StreamerProfileCard } from "./StreamerProfileCard";
import { useDonationPayment } from "./useDonationPayment";
import { cn } from "~/util/cn";

interface UnifiedDonationCardProps {
  profile: StreamerProfile;
  voices: TtsVoice[];
  onCreateDonation: (values: DonationFormValues) => Promise<DonationPayment>;
  className?: string;
}

export function UnifiedDonationCard({
  profile,
  voices,
  onCreateDonation,
  className,
}: UnifiedDonationCardProps) {
  const {
    form,
    payment,
    submitting,
    regenerating,
    error,
    status,
    connectionLost,
    handleSubmit,
    handleRegenerate,
    handleEditDonation,
  } = useDonationPayment({ profile, onCreateDonation });

  return (
    <div
      className={cn(
        "rounded-[28px] bg-card border border-line overflow-hidden animate-fade-in",
        className,
      )}
    >
      <div className="px-5 pt-5">
        <StreamerProfileCard profile={profile} />
      </div>

      <div className="p-5 pt-5">
        {error && (
          <div className="mb-4">
            <AlertMessage variant="error" message={error} />
          </div>
        )}
        {!error && connectionLost && payment && (
          <div className="mb-4">
            <AlertMessage
              variant="info"
              message="Conexão perdida. Tentando reconectar..."
            />
          </div>
        )}

        {!payment ? (
          <DonationFormInner
            profile={profile}
            voices={voices}
            loading={submitting || regenerating}
            form={form}
            onSubmit={handleSubmit}
          />
        ) : (
          <PaymentStep
            payment={payment}
            regenerating={regenerating}
            paymentFailed={status === "failed"}
            onRegenerate={handleRegenerate}
            onEdit={handleEditDonation}
          />
        )}
      </div>
    </div>
  );
}
