import { FormEvent, useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getCreditBalance } from '../api/credits';
import * as teamsApi from '../api/teams';

export function Profile() {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [team, setTeam] = useState<Awaited<ReturnType<typeof teamsApi.getMyTeam>>>(null);
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);

  const canUseTeams = user && user.planTier !== 'free';

  const refreshTeam = () => {
    teamsApi.getMyTeam().then(setTeam).catch(() => setTeam(null));
  };

  useEffect(() => {
    getCreditBalance().then(setCreditBalance).catch(() => setCreditBalance(null));
    if (canUseTeams) refreshTeam();
  }, [canUseTeams]);

  const handleCreateTeam = async (e: FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setTeamError(null);
    setTeamLoading(true);
    try {
      await teamsApi.createTeam(teamName);
      setTeamName('');
      refreshTeam();
    } catch (err: any) {
      setTeamError(err?.response?.data?.message ?? 'Could not create team');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!team || !inviteEmail.trim()) return;
    setTeamError(null);
    setTeamLoading(true);
    try {
      await teamsApi.inviteMember(team.team.id, inviteEmail);
      setInviteEmail('');
      refreshTeam();
    } catch (err: any) {
      setTeamError(err?.response?.data?.message ?? 'Could not invite that user');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!team) return;
    await teamsApi.removeMember(team.team.id, userId);
    refreshTeam();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile & settings</h1>

        <section className="card">
          <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-gray-900">{user?.fullName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Plan</dt>
              <dd className="text-gray-900 capitalize">{user?.planTier}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Credit balance</dt>
              <dd className="text-gray-900">{creditBalance ?? '—'}</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-gray-900">Team</h2>
          {!canUseTeams && (
            <p className="mt-2 text-sm text-gray-500">
              Team accounts are available on Pro and Enterprise plans.{' '}
              <a href="/pricing" className="text-brand-600 underline">Upgrade</a> to invite teammates.
            </p>
          )}

          {canUseTeams && !team && (
            <form className="mt-4 flex gap-2" onSubmit={handleCreateTeam}>
              <input
                className="input"
                placeholder="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <button type="submit" className="btn-primary shrink-0" disabled={teamLoading}>
                Create team
              </button>
            </form>
          )}

          {canUseTeams && team && (
            <div className="mt-4 space-y-4">
              <p className="font-medium text-gray-900">{team.team.name}</p>

              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {team.members.map((member) => (
                  <li key={member.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-gray-700">
                      {member.userId === user?.id ? 'You' : member.userId} — {member.role}
                    </span>
                    {member.role !== 'owner' && team.team.ownerId === user?.id && (
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => handleRemove(member.userId)}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {team.team.ownerId === user?.id && (
                <form className="flex gap-2" onSubmit={handleInvite}>
                  <input
                    type="email"
                    className="input"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <button type="submit" className="btn-secondary shrink-0" disabled={teamLoading}>
                    Invite
                  </button>
                </form>
              )}
            </div>
          )}

          {teamError && <p className="mt-2 text-sm text-red-600">{teamError}</p>}
        </section>
      </main>
    </div>
  );
}
