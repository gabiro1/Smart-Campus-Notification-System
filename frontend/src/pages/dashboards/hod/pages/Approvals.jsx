import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GovernancePage from "../../shared/GovernancePage";

export default function Approvals() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/hod/governance');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to Governance page...</p>
      </div>
    </div>
  );
}