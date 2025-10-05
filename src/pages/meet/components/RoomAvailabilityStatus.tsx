import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";

interface RoomAvailabilityStatusProps {
  isInvalid: boolean;
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
}

const RoomAvailabilityStatus: React.FC<RoomAvailabilityStatusProps> = ({
  isInvalid,
  isChecking,
  isAvailable,
  error,
}) => {
  if (isInvalid) {
    return (
      <div className='mt-2 mb-8 flex items-center gap-2 text-sm text-red-600'>
        <AlertCircle size={14} />
        <span>Room name cannot contain special characters.</span>
      </div>
    );
  }
  if (isChecking) {
    return (
      <div className='mt-2 mb-8 flex items-center gap-2 text-sm text-gray-500'>
        <Loader2 size={14} className='animate-spin' />
        <span>Checking availability...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className='mt-2 mb-8 flex items-center gap-2 text-sm text-red-600'>
        <XCircle size={14} />
        <span>{error}</span>
      </div>
    );
  }
  if (isAvailable === true) {
    return (
      <div className='mt-2 mb-8 flex items-center gap-2 text-sm text-green-600'>
        <CheckCircle2 size={14} />
        <span>Room name is available!</span>
      </div>
    );
  }
  if (isAvailable === false) {
    return (
      <div className='mt-2 mb-8 flex items-center gap-2 text-sm text-red-600'>
        <XCircle size={14} />
        <span>This room name is already booked.</span>
      </div>
    );
  }
  return null;
};

export default RoomAvailabilityStatus;