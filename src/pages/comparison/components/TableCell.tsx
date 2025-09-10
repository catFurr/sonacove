import { Check, CircleCheck, CircleX } from "lucide-react";
import type { IconType } from "./types";

const TableCell: React.FC<{
  content?: string;
  icon?: IconType;
  primary?: boolean;
  centerText?: boolean;
  note?: string;
}> = ({
  content = '',
  icon = null,
  primary = false,
  centerText = false,
  note = '',
}) => {
  const textAlign = centerText ? 'text-center' : '';

  return (
    <td className={`p-3 border border-gray-200 ${textAlign}`}>
      <div className='flex items-center justify-center gap-2'>
        {icon === 'check' && (
          <div className='flex-shrink-0 text-green-600'>
            {primary ? (
             <CircleCheck />
            ) : (
              <Check />
            )}
          </div>
        )}
        {icon === 'cross' && (
          <div className='flex-shrink-0 text-primary-600'>
            <CircleX />
          </div>
        )}
        {content && <span>{content}</span>}
      </div>
      {note && (
        <div className='text-xs text-gray-500 text-center mt-1'>{note}</div>
      )}
    </td>
  );
};

export default TableCell