import { useParams, useLocation } from "wouter";
import EstimatePreview from "@/components/estimate-preview";

export default function EstimatePreviewPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const handleAccept = () => {
    // Navigate to jobs page after accepting estimate
    setLocation('/jobs');
  };

  const handleBack = () => {
    // Navigate back to estimates page
    setLocation('/estimates');
  };

  if (!id) {
    return <div>Estimate not found</div>;
  }

  return (
    <EstimatePreview 
      estimateId={parseInt(id)} 
      onAccept={handleAccept}
      onBack={handleBack}
    />
  );
}