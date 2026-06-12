import { useParams, Navigate } from 'react-router-dom';
import GuestList from '../../components/GuestList';

export default function GuestsTab() {
  const { invId } = useParams<{ invId: string }>();
  if (!invId) return <Navigate to="/dashboard" replace />;
  return <GuestList invitationId={invId} />;
}
