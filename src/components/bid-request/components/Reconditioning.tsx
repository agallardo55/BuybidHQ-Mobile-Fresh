
import { BidRequest } from "../types";

interface ReconditioningProps {
  request: BidRequest;
}

const Reconditioning = ({ request }: ReconditioningProps) => {
  return (
    <div>
      <div className="bg-white p-3 rounded-lg border">
        <h3 className="font-semibold text-lg mb-2">Reconditioning</h3>
        <div className="space-y-2">
          <div className="text-sm">
            <div className="font-bold text-black mb-1">Estimate:</div>
            <div className="font-normal text-lg">${request.reconEstimate || '0'}</div>
          </div>
          <div className="text-sm">
            <div className="font-bold text-black mb-1">Details:</div>
            <div className="font-normal whitespace-pre-wrap bg-gray-50 p-2 rounded-md max-h-[200px] overflow-y-auto">
              {request.reconDetails || 'No details provided'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reconditioning;
