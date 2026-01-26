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
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-sidebar-background border-r border-sidebar-border overflow-y-auto hidden md:block transition-all">
      <div className="p-6 space-y-8">
        {/* Team Selection */}
        <div>
          <button
            onClick={() => setExpandTeams(!expandTeams)}
            className="flex items-center justify-between w-full mb-4 group"
          >
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Teams</h3>
            <ChevronDown
              size={14}
              className={cn(
                "text-neutral-400 transition-transform duration-200",
                expandTeams ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>
          {expandTeams && (
            <div className="space-y-1">
              {SAMPLE_TEAMS.map((team) => (
                <button
                  key={team}
                  onClick={() => handleTeamSelect(team)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
                    selectedTeam === team
                      ? "bg-brown text-white font-semibold shadow-md shadow-brown/40"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  {team}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Player Selection */}
        <div>
          <button
            onClick={() => setExpandPlayers(!expandPlayers)}
            className="flex items-center justify-between w-full mb-4 group"
          >
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Players</h3>
            <ChevronDown
              size={14}
              className={cn(
                "text-neutral-400 transition-transform duration-200",
                expandPlayers ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>
          {expandPlayers && (
            <div className="space-y-1">
              {SAMPLE_PLAYERS.map((player) => (
                <button
                  key={player}
                  onClick={() => handlePlayerSelect(player)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
                    selectedPlayer === player
                      ? "bg-brown text-white font-semibold shadow-md shadow-brown/40"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
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
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Filters</h3>
          <div className="space-y-4 text-sm">
            <label className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-neutral-700 bg-black checked:bg-brown checked:border-brown transition-all"
                />
                <svg className="absolute w-3 h-3 text-white hidden peer-checked:block left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="ml-3 text-muted-foreground group-hover:text-foreground transition-colors font-medium">Recent Matches</span>
            </label>
            <label className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-neutral-700 bg-black checked:bg-brown checked:border-brown transition-all"
                />
                <svg className="absolute w-3 h-3 text-white hidden peer-checked:block left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="ml-3 text-muted-foreground group-hover:text-foreground transition-colors font-medium">Ranked Only</span>
            </label>
            <label className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-neutral-700 bg-black checked:bg-brown checked:border-brown transition-all"
                />
                <svg className="absolute w-3 h-3 text-white hidden peer-checked:block left-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="ml-3 text-muted-foreground group-hover:text-foreground transition-colors font-medium">Show All Roles</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
