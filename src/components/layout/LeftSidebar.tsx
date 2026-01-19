"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onPlayerSelect?: (player: string) => void;
  onTeamSelect?: (team: string) => void;
}

const SAMPLE_TEAMS = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"];

const SAMPLE_PLAYERS = [
  "Player One",
  "Player Two",
  "Player Three",
  "Player Four",
  "Player Five",
];

export function LeftSidebar({ onPlayerSelect, onTeamSelect }: SidebarProps) {
  const [expandTeams, setExpandTeams] = useState(true);
  const [expandPlayers, setExpandPlayers] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    SAMPLE_TEAMS[0],
  );
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(
    SAMPLE_PLAYERS[0],
  );

  const handleTeamSelect = (team: string) => {
    setSelectedTeam(team);
    onTeamSelect?.(team);
  };

  const handlePlayerSelect = (player: string) => {
    setSelectedPlayer(player);
    onPlayerSelect?.(player);
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-56 bg-neutral-50 border-r border-neutral-200 overflow-y-auto hidden md:block">
      <div className="p-6">
        {/* Team Selection */}
        <div className="mb-8">
          <button
            onClick={() => setExpandTeams(!expandTeams)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="text-sm font-semibold text-black">Teams</h3>
            <ChevronDown
              size={16}
              className={cn(
                "text-neutral-600 transition-transform",
                expandTeams ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>
          {expandTeams && (
            <div className="space-y-2">
              {SAMPLE_TEAMS.map((team) => (
                <button
                  key={team}
                  onClick={() => handleTeamSelect(team)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded transition-colors",
                    selectedTeam === team
                      ? "bg-brown text-white font-medium"
                      : "text-neutral-700 hover:bg-neutral-200",
                  )}
                >
                  {team}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Player Selection */}
        <div className="mb-8">
          <button
            onClick={() => setExpandPlayers(!expandPlayers)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="text-sm font-semibold text-black">Players</h3>
            <ChevronDown
              size={16}
              className={cn(
                "text-neutral-600 transition-transform",
                expandPlayers ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>
          {expandPlayers && (
            <div className="space-y-2">
              {SAMPLE_PLAYERS.map((player) => (
                <button
                  key={player}
                  onClick={() => handlePlayerSelect(player)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded transition-colors",
                    selectedPlayer === player
                      ? "bg-brown text-white font-medium"
                      : "text-neutral-700 hover:bg-neutral-200",
                  )}
                >
                  {player}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div>
          <h3 className="text-sm font-semibold text-black mb-3">Filters</h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 mr-2 accent-brown"
              />
              <span className="text-neutral-700">Recent Matches</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 mr-2 accent-brown"
              />
              <span className="text-neutral-700">Ranked Only</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 mr-2 accent-brown" />
              <span className="text-neutral-700">Show All Roles</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
